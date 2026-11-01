'use strict';

/**
 * Seed data for local development and demos. DESTRUCTIVE: it empties every collection first.
 * Refuses to run when NODE_ENV=production unless --force is passed.
 *
 * Accounts (password from SEED_PASSWORD, default "EcoLoop@2026"):
 *   admin      identifier: ecoloop_admin
 *   company    identifier: company1@ecoloop.test  (and company2 / company3)
 *   collector  identifier: collector1@ecoloop.test  (approved)
 */
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const logger = require('./lib/logger');
const { runMigrations } = require('./migrate');
const { todayLocal, addMonths } = require('./lib/dates');
const { User, Package, Company, Collector, Pickup } = require('./models');

const PASSWORD = process.env.SEED_PASSWORD || 'EcoLoop@2026';

const COMPANIES = [
  { n: 1, name: 'Gulf Beverages Factory', category: 'factory', address: 'Industrial Zone, Suez', lng: 32.5498, lat: 29.9668, target: 250, slot: '09:00', freq: 'weekly' },
  { n: 2, name: 'Canal Hotel', category: 'hotel', address: 'Port Tawfik Rd, Suez', lng: 32.56, lat: 29.9702, target: 120, slot: '11:00', freq: 'twice_weekly' },
  { n: 3, name: 'Nile Print House', category: 'office', address: 'Downtown, Cairo', lng: 31.2357, lat: 30.0444, target: 80, slot: '13:00', freq: 'monthly' },
];

async function runSeed() {
  if (config.env === 'production' && !process.argv.includes('--force')) {
    throw new Error('Refusing to seed in production without --force');
  }

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all([User, Package, Company, Collector, Pickup].map((m) => m.deleteMany({})));
  await runMigrations();

  const passwordHash = await bcrypt.hash(PASSWORD, config.bcryptCost);

  // Admin is created here only: there is no public admin registration.
  await User.create({
    fullname: 'System Administrator',
    username: 'ecoloop_admin',
    phone: '+201000000000',
    age: 30,
    address: 'Suez, Egypt',
    passwordHash,
    role: 'admin',
  });

  const [pkg3, pkg6, pkg12] = await Package.create([
    { name: 'Quarterly', durationMonths: 3, priceEGP: 1500, discountPercent: 0 },
    { name: 'Half-year', durationMonths: 6, priceEGP: 2800, discountPercent: 10 },
    { name: 'Annual Sustainability', durationMonths: 12, priceEGP: 5000, discountPercent: 20 },
  ]);
  void pkg3;
  void pkg12;

  const collectorUser = await User.create({
    fullname: 'Mahmoud Collector',
    email: 'collector1@ecoloop.test',
    phone: '+201022222222',
    age: 29,
    address: 'Suez, Egypt',
    passwordHash,
    role: 'collector',
  });
  // Demo only: placeholder document names. Real collectors upload images through the API.
  const collector = await Collector.create({
    userId: collectorUser._id,
    documents: { nationalId: 'seed-demo', criminalRecord: 'seed-demo', faceId: 'seed-demo' },
    isApprovedByAdmin: true,
    approvedAt: new Date(),
  });

  const today = todayLocal();
  const start = new Date();
  for (const c of COMPANIES) {
    const user = await User.create({
      fullname: `${c.name} Representative`,
      email: `company${c.n}@ecoloop.test`,
      phone: `+20101000000${c.n}`,
      age: 35,
      address: c.address,
      passwordHash,
      role: 'company',
    });
    const company = await Company.create({
      userId: user._id,
      companyName: c.name,
      category: c.category,
      address: c.address,
      packageId: pkg6._id,
      visitFrequency: c.freq,
      contractStartDate: start,
      contractEndDate: addMonths(start, pkg6.durationMonths),
      location: { type: 'Point', coordinates: [c.lng, c.lat] },
      monthlyTargetKg: c.target,
    });
    await Pickup.create({
      companyId: company._id,
      collectorId: collector._id,
      scheduledDate: today,
      timeSlot: c.slot,
      qrToken: crypto.randomBytes(16).toString('hex'),
    });
  }

  logger.info('seed complete', { admin: 'ecoloop_admin', companies: COMPANIES.length, collectors: 1 });
  await mongoose.disconnect();
}

runSeed().catch(async (err) => {
  logger.error('seed failed', { error: err.message });
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
