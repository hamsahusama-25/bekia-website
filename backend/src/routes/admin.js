'use strict';

const crypto = require('node:crypto');
const express = require('express');
const { Package, Company, Collector, Pickup } = require('../models');
const { STATUSES } = require('../models/Pickup');
const { requireAuth } = require('../middleware/auth');
const {
  objectId,
  createPickupSchema,
  approveCollectorSchema,
  updatePackageSchema,
} = require('../schemas');
const { notFound, conflict, badRequest } = require('../lib/errors');
const { monthKey, todayLocal } = require('../lib/dates');
const { levelFor, pointsForPickup, round2 } = require('../lib/points');
const { ok } = require('../lib/respond');

const router = express.Router();
router.use(requireAuth('admin'));

/* ---------- Collectors ---------- */

router.get('/collectors', async (req, res) => {
  const status = ['pending', 'approved'].includes(req.query.status) ? req.query.status : 'all';
  const filter = status === 'all' ? {} : { isApprovedByAdmin: status === 'approved' };
  const collectors = await Collector.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'fullname email phone age address');

  return ok(
    req,
    res,
    collectors.map((c) => ({
      id: String(c._id),
      fullname: c.userId.fullname,
      email: c.userId.email,
      phone: c.userId.phone,
      age: c.userId.age,
      address: c.userId.address,
      isApprovedByAdmin: c.isApprovedByAdmin,
      documentsComplete: c.hasAllDocuments(),
      documents: c.documents, // file names, fetched through GET /api/files/:name
    })),
  );
});

router.patch('/collectors/:id/approve', async (req, res) => {
  const id = objectId.parse(req.params.id);
  const { monthlyCompanyTarget } = approveCollectorSchema.parse(req.body || {});

  const collector = await Collector.findById(id);
  if (!collector) throw notFound('COLLECTOR_NOT_FOUND');
  if (!collector.hasAllDocuments()) throw conflict('DOCUMENTS_INCOMPLETE', 'National ID, criminal record and face ID are all required');

  collector.isApprovedByAdmin = true;
  collector.approvedAt = new Date();
  if (monthlyCompanyTarget !== undefined) collector.monthlyCompanyTarget = monthlyCompanyTarget;
  await collector.save();

  return ok(req, res, { id: String(collector._id), isApprovedByAdmin: true });
});

/* ---------- Companies & packages ---------- */

router.get('/companies', async (req, res) => {
  const companies = await Company.find().sort({ companyName: 1 }).populate('packageId', 'name durationMonths');
  return ok(
    req,
    res,
    companies.map((c) => ({
      id: String(c._id),
      companyName: c.companyName,
      category: c.category,
      address: c.address,
      visitFrequency: c.visitFrequency,
      packageName: c.packageId && c.packageId.name,
      contractEndDate: c.contractEndDate,
      location: { lng: c.location.coordinates[0], lat: c.location.coordinates[1] },
    })),
  );
});

router.put('/packages/:id', async (req, res) => {
  const id = objectId.parse(req.params.id);
  const changes = updatePackageSchema.parse(req.body);
  const pkg = await Package.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true });
  if (!pkg) throw notFound('PACKAGE_NOT_FOUND');
  return ok(req, res, {
    id: String(pkg._id),
    name: pkg.name,
    priceEGP: pkg.priceEGP,
    discountPercent: pkg.discountPercent,
    isActive: pkg.isActive,
  });
});

/* ---------- Pickups ---------- */

// Assigns a company to a collector for a day and time slot; this also creates the company's QR token.
router.post('/pickups', async (req, res) => {
  const data = createPickupSchema.parse(req.body);
  if (data.scheduledDate < todayLocal()) throw badRequest('PAST_DATE', 'scheduledDate cannot be in the past');

  const [company, collector] = await Promise.all([Company.findById(data.companyId), Collector.findById(data.collectorId)]);
  if (!company) throw notFound('COMPANY_NOT_FOUND');
  if (!collector) throw notFound('COLLECTOR_NOT_FOUND');
  if (!collector.isApprovedByAdmin) throw conflict('COLLECTOR_NOT_APPROVED', 'Approve the collector first');
  if (new Date(`${data.scheduledDate}T00:00:00Z`) > company.contractEndDate) {
    throw conflict('CONTRACT_EXPIRED', 'The company contract ends before this date');
  }

  const pickup = await Pickup.create({
    companyId: company._id,
    collectorId: collector._id,
    scheduledDate: data.scheduledDate,
    timeSlot: data.timeSlot,
    qrToken: crypto.randomBytes(16).toString('hex'),
  });

  return ok(req, res, { id: String(pickup._id), status: pickup.status }, 201);
});

router.get('/pickups', async (req, res) => {
  const filter = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
  const pickups = await Pickup.find(filter)
    .sort({ scheduledDate: -1, timeSlot: -1 })
    .limit(100)
    .populate('companyId', 'companyName address')
    .populate({ path: 'collectorId', populate: { path: 'userId', select: 'fullname' } });

  // qrToken is intentionally not returned here.
  return ok(
    req,
    res,
    pickups.map((p) => ({
      id: String(p._id),
      status: p.status,
      scheduledDate: p.scheduledDate,
      timeSlot: p.timeSlot,
      companyName: p.companyId && p.companyId.companyName,
      collectorName: p.collectorId && p.collectorId.userId && p.collectorId.userId.fullname,
      items: p.items,
      totalWeightKg: p.totalWeightKg,
      scalePhoto: p.scalePhoto,
      pointsAwarded: p.pointsAwarded,
      noShowDistanceMeters: p.noShow && p.noShow.distanceMeters,
    })),
  );
});

// Admin confirms a collected shipment: updates the month's weight and credits wallet points.
router.post('/pickups/:id/approve', async (req, res) => {
  const id = objectId.parse(req.params.id);
  const pickup = await Pickup.findById(id);
  if (!pickup) throw notFound('PICKUP_NOT_FOUND');
  if (pickup.status !== 'PENDING_REVIEW') throw conflict('PICKUP_NOT_PENDING', 'Only pending shipments can be approved');

  const company = await Company.findById(pickup.companyId);
  const month = monthKey();

  const [agg] = await Pickup.aggregate([
    { $match: { companyId: pickup.companyId, status: 'COMPLETED', approvedMonth: month } },
    { $group: { _id: null, kg: { $sum: '$totalWeightKg' } } },
  ]);
  const monthKgBefore = agg ? agg.kg : 0;
  const points = pointsForPickup({
    weightKg: pickup.totalWeightKg,
    monthKgBefore,
    targetKg: company.monthlyTargetKg,
  });

  const approved = await Pickup.findOneAndUpdate(
    { _id: pickup._id, status: 'PENDING_REVIEW' },
    {
      $set: {
        status: 'COMPLETED',
        approvedAt: new Date(),
        approvedBy: req.user.sub,
        approvedMonth: month,
        pointsAwarded: points.total,
      },
    },
    { new: true },
  );
  if (!approved) throw conflict('PICKUP_NOT_PENDING', 'Only pending shipments can be approved');

  const updatedCompany = await Company.findByIdAndUpdate(company._id, { $inc: { pointsWallet: points.total } }, { new: true });
  const monthCollectedKg = round2(monthKgBefore + pickup.totalWeightKg);

  return ok(req, res, {
    pickupId: String(approved._id),
    status: approved.status,
    totalWeightKg: approved.totalWeightKg,
    pointsAwarded: points.total,
    bonusPoints: points.bonus,
    monthCollectedKg,
    targetLevel: levelFor(monthCollectedKg, company.monthlyTargetKg),
    pointsWallet: updatedCompany.pointsWallet,
  });
});

/* ---------- Stats ---------- */

router.get('/stats', async (req, res) => {
  const month = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : monthKey();
  const match = { status: 'COMPLETED', approvedMonth: month };

  const [byType, servedCompanies, completedPickups, activeOrders, pendingCollectors, noShows] = await Promise.all([
    Pickup.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.trashType', kg: { $sum: '$items.weightKg' } } },
    ]),
    Pickup.distinct('companyId', match),
    Pickup.countDocuments(match),
    Pickup.countDocuments({ status: { $in: ['SCHEDULED', 'PENDING_REVIEW'] } }),
    Collector.countDocuments({ isApprovedByAdmin: false }),
    Pickup.countDocuments({ status: 'NO_SHOW' }),
  ]);

  const weightByType = Object.fromEntries(byType.map((t) => [t._id, round2(t.kg)]));
  return ok(req, res, {
    month,
    companiesServed: servedCompanies.length,
    completedPickups,
    totalWeightKg: round2(Object.values(weightByType).reduce((a, b) => a + b, 0)),
    weightByType,
    activeOrders,
    pendingCollectors,
    noShows,
  });
});

module.exports = router;
