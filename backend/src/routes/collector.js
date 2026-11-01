'use strict';

const express = require('express');
const { Collector, Company, Pickup } = require('../models');
const { requireAuth, requireApprovedCollector } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { routeQuerySchema } = require('../schemas');
const { buildSmartRoutePipeline } = require('../lib/geo');
const { saveImage } = require('../lib/files');
const { badRequest, conflict } = require('../lib/errors');
const { todayLocal, monthKey } = require('../lib/dates');
const { ok } = require('../lib/respond');

const router = express.Router();

const DOC_FIELDS = [
  { name: 'nationalId', maxCount: 1 },
  { name: 'criminalRecord', maxCount: 1 },
  { name: 'faceId', maxCount: 1 },
];

// A freshly registered collector uploads the hiring documents here, then waits for admin approval.
router.post('/documents', requireAuth('collector'), upload.fields(DOC_FIELDS), async (req, res) => {
  const files = req.files || {};
  const provided = DOC_FIELDS.map((f) => f.name).filter((n) => files[n] && files[n][0]);
  if (!provided.length) throw badRequest('NO_FILES', 'Attach at least one of: nationalId, criminalRecord, faceId');

  const collector = await Collector.findOne({ userId: req.user.sub });
  if (!collector) throw badRequest('COLLECTOR_PROFILE_MISSING');
  if (collector.isApprovedByAdmin) throw conflict('ALREADY_APPROVED', 'Documents cannot change after approval');

  for (const name of provided) {
    collector.set(`documents.${name}`, await saveImage(files[name][0].buffer));
  }
  await collector.save();

  return ok(req, res, {
    nationalId: Boolean(collector.documents.nationalId),
    criminalRecord: Boolean(collector.documents.criminalRecord),
    faceId: Boolean(collector.documents.faceId),
    complete: collector.hasAllDocuments(),
  });
});

router.get('/me', requireAuth('collector'), async (req, res) => {
  const collector = await Collector.findOne({ userId: req.user.sub });
  return ok(req, res, {
    isApprovedByAdmin: Boolean(collector && collector.isApprovedByAdmin),
    documentsComplete: Boolean(collector && collector.hasAllDocuments()),
  });
});

// Today's stops, nearest first, using MongoDB $geoNear on the 2dsphere index (no paid map API).
router.get('/smartroute', requireAuth('collector'), requireApprovedCollector, async (req, res) => {
  const { lng, lat, date } = routeQuerySchema.parse(req.query);

  const pickups = await Pickup.find({
    collectorId: req.collector._id,
    scheduledDate: date || todayLocal(),
    status: 'SCHEDULED',
  }).sort({ timeSlot: 1 });

  const completedCompanies = await Pickup.distinct('companyId', {
    collectorId: req.collector._id,
    status: 'COMPLETED',
    approvedMonth: monthKey(),
  });
  const progress = {
    completedCompaniesThisMonth: completedCompanies.length,
    monthlyCompanyTarget: req.collector.monthlyCompanyTarget,
  };

  if (!pickups.length) return ok(req, res, { stops: [], progress });

  const byCompany = new Map();
  for (const p of pickups) {
    const key = String(p.companyId);
    byCompany.set(key, [...(byCompany.get(key) || []), p]);
  }

  const ordered = await Company.aggregate(
    buildSmartRoutePipeline({ companyIds: pickups.map((p) => p.companyId), lng, lat }),
  );

  const stops = ordered.flatMap((c) =>
    (byCompany.get(String(c._id)) || []).map((p) => ({
      pickupId: String(p._id),
      companyName: c.companyName,
      category: c.category,
      address: c.address,
      timeSlot: p.timeSlot,
      distanceMeters: Math.round(c.distanceMeters),
      location: { lng: c.location.coordinates[0], lat: c.location.coordinates[1] },
    })),
  );

  return ok(req, res, { stops, progress });
});

module.exports = router;
