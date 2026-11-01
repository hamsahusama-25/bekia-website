'use strict';

const crypto = require('node:crypto');
const express = require('express');
const config = require('../config');
const { Company, Pickup } = require('../models');
const { requireAuth, requireApprovedCollector } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { objectId, completePickupSchema, coordsSchema } = require('../schemas');
const { haversineMeters } = require('../lib/geo');
const { saveImage } = require('../lib/files');
const { round2 } = require('../lib/points');
const { AppError, badRequest, notFound, conflict } = require('../lib/errors');
const { ok } = require('../lib/respond');

const router = express.Router();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Loads a pickup that belongs to the calling collector; other collectors' pickups look like 404. */
async function ownPickup(req) {
  const id = objectId.parse(req.params.id);
  const pickup = await Pickup.findOne({ _id: id, collectorId: req.collector._id });
  if (!pickup) throw notFound('PICKUP_NOT_FOUND');
  return pickup;
}

/**
 * Success path: the collector scans the company's QR, enters weights by trash type and attaches the
 * scale photo. The pickup then waits for admin approval (PENDING_REVIEW).
 * multipart/form-data: qrToken, items (JSON string), scalePhoto (file)
 */
router.post(
  '/:id/complete',
  requireAuth('collector'),
  requireApprovedCollector,
  upload.single('scalePhoto'),
  async (req, res) => {
    let rawItems;
    try {
      rawItems = JSON.parse((req.body && req.body.items) || '');
    } catch {
      throw badRequest('INVALID_ITEMS', 'items must be a JSON array of { trashType, weightKg }');
    }
    const body = completePickupSchema.parse({ qrToken: req.body && req.body.qrToken, items: rawItems });
    if (!req.file) throw badRequest('MISSING_SCALE_PHOTO', 'A photo of the scale is required');

    const pickup = await ownPickup(req);
    if (pickup.status !== 'SCHEDULED') throw conflict('PICKUP_NOT_SCHEDULED', 'This pickup was already handled');
    if (!safeEqual(pickup.qrToken, body.qrToken)) {
      throw badRequest('INVALID_QR_HANDSHAKE', 'QR code does not match this pickup');
    }

    const scalePhoto = await saveImage(req.file.buffer);
    const items = body.items.map((i) => ({ trashType: i.trashType, weightKg: round2(i.weightKg) }));
    const totalWeightKg = round2(items.reduce((sum, i) => sum + i.weightKg, 0));

    // The status condition makes a double submit lose the race instead of overwriting.
    const updated = await Pickup.findOneAndUpdate(
      { _id: pickup._id, status: 'SCHEDULED' },
      { $set: { status: 'PENDING_REVIEW', items, totalWeightKg, scalePhoto, completedAt: new Date() } },
      { new: true },
    );
    if (!updated) throw conflict('PICKUP_NOT_SCHEDULED', 'This pickup was already handled');

    return ok(req, res, { pickupId: String(updated._id), status: updated.status, totalWeightKg });
  },
);

/**
 * Failure path: "company closed / no response". The server compares the collector's GPS with the
 * company location and rejects the report if the collector is not actually there.
 */
router.post('/:id/no-show', requireAuth('collector'), requireApprovedCollector, async (req, res) => {
  const { lng, lat } = coordsSchema.parse(req.body);
  const pickup = await ownPickup(req);
  if (pickup.status !== 'SCHEDULED') throw conflict('PICKUP_NOT_SCHEDULED', 'This pickup was already handled');

  const company = await Company.findById(pickup.companyId);
  const distance = haversineMeters([lng, lat], company.location.coordinates);
  if (distance > config.noShowMaxMeters) {
    throw new AppError(400, 'GPS_VERIFICATION_FAILED', 'You are too far from the company location', {
      distanceMeters: Math.round(distance),
      maxMeters: config.noShowMaxMeters,
    });
  }

  const updated = await Pickup.findOneAndUpdate(
    { _id: pickup._id, status: 'SCHEDULED' },
    { $set: { status: 'NO_SHOW', noShow: { at: new Date(), coordinates: [lng, lat], distanceMeters: Math.round(distance) } } },
    { new: true },
  );
  if (!updated) throw conflict('PICKUP_NOT_SCHEDULED', 'This pickup was already handled');

  return ok(req, res, { pickupId: String(updated._id), status: updated.status });
});

module.exports = router;
