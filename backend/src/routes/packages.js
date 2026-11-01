'use strict';

const express = require('express');
const { Package } = require('../models');
const { ok } = require('../lib/respond');

const router = express.Router();

// Public: the registration form needs the packages before an account exists.
router.get('/', async (req, res) => {
  const packages = await Package.find({ isActive: true }).sort({ durationMonths: 1 });
  return ok(
    req,
    res,
    packages.map((p) => ({
      id: String(p._id),
      name: p.name,
      durationMonths: p.durationMonths,
      priceEGP: p.priceEGP,
      discountPercent: p.discountPercent,
      finalPriceEGP: Math.round(p.priceEGP * (1 - p.discountPercent / 100) * 100) / 100,
    })),
  );
});

module.exports = router;
