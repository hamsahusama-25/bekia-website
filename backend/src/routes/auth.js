'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { User, Package, Company, Collector } = require('../models');
const { registerSchema, loginSchema } = require('../schemas');
const { signToken } = require('../middleware/auth');
const { badRequest, unauthorized } = require('../lib/errors');
const { addMonths } = require('../lib/dates');
const { ok } = require('../lib/respond');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.env === 'test',
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      requestId: req.requestId,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' },
    }),
});

// Compared against when the user does not exist, so timing does not reveal valid accounts.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', config.bcryptCost);

const publicUser = (u) => ({ id: String(u._id), fullname: u.fullname, role: u.role });

router.post('/register', limiter, async (req, res) => {
  const data = registerSchema.parse(req.body);

  let pkg = null;
  if (data.role === 'company') {
    pkg = await Package.findOne({ _id: data.packageId, isActive: true });
    if (!pkg) throw badRequest('INVALID_PACKAGE', 'Selected package does not exist');
  }

  const passwordHash = await bcrypt.hash(data.password, config.bcryptCost);
  const user = await User.create({
    fullname: data.fullname,
    email: data.email,
    phone: data.phone,
    age: data.age,
    address: data.address,
    passwordHash,
    role: data.role,
  });

  try {
    if (data.role === 'company') {
      const start = new Date();
      await Company.create({
        userId: user._id,
        companyName: data.companyName,
        category: data.category,
        address: data.companyAddress,
        packageId: pkg._id,
        visitFrequency: data.visitFrequency,
        contractStartDate: start,
        contractEndDate: addMonths(start, pkg.durationMonths),
        location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
      });
    } else {
      await Collector.create({ userId: user._id });
    }
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // no multi-document transactions on a standalone MongoDB
    throw err;
  }

  return ok(req, res, { token: signToken(user), user: publicUser(user) }, 201);
});

router.post('/login', limiter, async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);
  const id = identifier.toLowerCase();

  const user = await User.findOne({ $or: [{ email: id }, { username: id }, { phone: identifier }] }).select(
    '+passwordHash',
  );
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) throw unauthorized('INVALID_CREDENTIALS', 'Wrong email/phone/username or password');

  return ok(req, res, { token: signToken(user), user: publicUser(user) });
});

module.exports = router;
