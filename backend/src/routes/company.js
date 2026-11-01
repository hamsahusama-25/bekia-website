'use strict';

const express = require('express');
const { Company, Pickup } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { notFound } = require('../lib/errors');
const { monthKey, todayLocal } = require('../lib/dates');
const { levelFor, round2 } = require('../lib/points');
const { ok } = require('../lib/respond');

const router = express.Router();
const DAY_MS = 24 * 60 * 60 * 1000;

router.get('/dashboard', requireAuth('company'), async (req, res) => {
  const company = await Company.findOne({ userId: req.user.sub }).populate('packageId');
  if (!company) throw notFound('COMPANY_NOT_FOUND');

  const [agg] = await Pickup.aggregate([
    { $match: { companyId: company._id, status: 'COMPLETED', approvedMonth: monthKey() } },
    { $group: { _id: null, kg: { $sum: '$totalWeightKg' } } },
  ]);
  const collectedKg = round2(agg ? agg.kg : 0);

  const next = await Pickup.findOne({
    companyId: company._id,
    status: 'SCHEDULED',
    scheduledDate: { $gte: todayLocal() },
  })
    .sort({ scheduledDate: 1, timeSlot: 1 })
    .populate({ path: 'collectorId', populate: { path: 'userId', select: 'fullname' } });

  return ok(req, res, {
    companyName: company.companyName,
    contract: {
      packageName: company.packageId.name,
      durationMonths: company.packageId.durationMonths,
      visitFrequency: company.visitFrequency,
      startDate: company.contractStartDate,
      endDate: company.contractEndDate,
      daysRemaining: Math.max(0, Math.ceil((company.contractEndDate - Date.now()) / DAY_MS)),
    },
    target: {
      month: monthKey(),
      collectedKg,
      targetKg: company.monthlyTargetKg,
      level: levelFor(collectedKg, company.monthlyTargetKg),
    },
    pointsWallet: company.pointsWallet,
    nextPickup: next
      ? {
          pickupId: String(next._id),
          scheduledDate: next.scheduledDate,
          timeSlot: next.timeSlot,
          collectorName: next.collectorId.userId.fullname,
          qrToken: next.qrToken, // the company shows this QR to the collector
        }
      : null,
  });
});

module.exports = router;
