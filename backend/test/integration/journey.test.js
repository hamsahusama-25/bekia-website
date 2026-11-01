'use strict';

/**
 * End-to-end tests against a real MongoDB (see test/helpers/db.js).
 * Covers the first user journey (success case) and the negative cases from docs/09-testing.md.
 * The tests run in order and share state, like the real journey does.
 */
require('../helpers/env');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { startTestDb } = require('../helpers/db');
const { createApp } = require('../../src/app');
const { runMigrations } = require('../../src/migrate');
const { User, Package, Company } = require('../../src/models');
const { todayLocal } = require('../../src/lib/dates');

const PASSWORD = 'EcoLoop@2026';
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);

// Suez (company A, near the collector) and Cairo (company B, ~125 km away)
const AT_A = { lng: 32.5498, lat: 29.9668 };
const AT_B = { lng: 31.2357, lat: 30.0444 };

describe('first user journey', () => {
  let db;
  let api;
  const s = {}; // shared state: tokens and ids

  const auth = (token) => ({ Authorization: `Bearer ${token}` });
  const login = async (identifier) => {
    const res = await api.post('/api/auth/login').send({ identifier, password: PASSWORD });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body.data.token;
  };
  const person = (n) => ({
    fullname: `Test Person ${n}`,
    email: `person${n}@example.com`,
    phone: `+2010000000${String(n).padStart(2, '0')}`,
    age: 30,
    address: '12 Test Street, Suez',
    password: PASSWORD,
  });
  const companyBody = (n, name, loc) => ({
    ...person(n),
    role: 'company',
    companyName: name,
    category: 'factory',
    companyAddress: `${name} address, Egypt`,
    packageId: s.packageId,
    visitFrequency: 'weekly',
    location: loc,
  });
  const registerCollector = (n) => api.post('/api/auth/register').send({ ...person(n), role: 'collector' });
  const completeBody = (pickupId, token, qr, items, photo = PNG) => {
    let req = api.post(`/api/pickups/${pickupId}/complete`).set(auth(token));
    if (qr !== undefined) req = req.field('qrToken', qr);
    if (items !== undefined) req = req.field('items', JSON.stringify(items));
    if (photo) req = req.attach('scalePhoto', photo, { filename: 'scale.png', contentType: 'image/png' });
    return req;
  };

  before(async () => {
    db = await startTestDb();
    await runMigrations(); // creates the 2dsphere index that $geoNear needs
    api = request(createApp());

    await User.create({
      fullname: 'System Administrator',
      username: 'ecoloop_admin',
      phone: '+201000000000',
      age: 30,
      address: 'Suez',
      passwordHash: await bcrypt.hash(PASSWORD, 4),
      role: 'admin',
    });
    await Package.create([
      { name: 'Quarterly', durationMonths: 3, priceEGP: 1500 },
      { name: 'Half-year', durationMonths: 6, priceEGP: 2800, discountPercent: 10 },
      { name: 'Annual', durationMonths: 12, priceEGP: 5000, discountPercent: 20 },
    ]);
  });

  after(async () => {
    await db.stop();
  });

  it('health is UP when MongoDB is connected', async () => {
    const res = await api.get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'UP');
  });

  it('lists the three packages publicly, with the discounted final price', async () => {
    const res = await api.get('/api/packages');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((p) => p.durationMonths), [3, 6, 12]);
    const half = res.body.data[1];
    assert.equal(half.finalPriceEGP, 2520);
    s.packageId = half.id;
  });

  it('registers two companies and never returns the password hash', async () => {
    const a = await api.post('/api/auth/register').send(companyBody(1, 'Gulf Factory', AT_A));
    assert.equal(a.status, 201, JSON.stringify(a.body));
    assert.equal(a.body.data.user.role, 'company');
    assert.equal(JSON.stringify(a.body).includes('passwordHash'), false);
    s.companyA = a.body.data.token;

    const b = await api.post('/api/auth/register').send(companyBody(2, 'Cairo Print House', AT_B));
    assert.equal(b.status, 201);
    s.companyB = b.body.data.token;
  });

  it('rejects a duplicate email (409) and an unknown package (400)', async () => {
    const dup = await api.post('/api/auth/register').send(companyBody(1, 'Another', AT_A));
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, 'DUPLICATE');

    const badPkg = await api.post('/api/auth/register').send({ ...companyBody(9, 'X Company', AT_A), packageId: '507f1f77bcf86cd799439011' });
    assert.equal(badPkg.status, 400);
    assert.equal(badPkg.body.error.code, 'INVALID_PACKAGE');
  });

  it('login: wrong password is 401 INVALID_CREDENTIALS; phone and email both work', async () => {
    const bad = await api.post('/api/auth/login').send({ identifier: 'person1@example.com', password: 'wrong-password' });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal((await api.post('/api/auth/login').send({ identifier: '+201000000001', password: PASSWORD })).status, 200);
    assert.equal((await api.post('/api/auth/login').send({ identifier: 'PERSON1@example.com', password: PASSWORD })).status, 200);
  });

  it('collector registers but cannot work until approved', async () => {
    const res = await registerCollector(3);
    assert.equal(res.status, 201);
    s.collector = res.body.data.token;
    const route = await api.get('/api/collector/smartroute?lng=32.55&lat=29.96').set(auth(s.collector));
    assert.equal(route.status, 403);
    assert.equal(route.body.error.code, 'COLLECTOR_NOT_APPROVED');
  });

  it('admin cannot approve a collector before the documents are uploaded (409)', async () => {
    s.admin = await login('ecoloop_admin');
    const list = await api.get('/api/admin/collectors?status=pending').set(auth(s.admin));
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    s.collectorId = list.body.data[0].id;
    assert.equal(list.body.data[0].documentsComplete, false);

    const res = await api.patch(`/api/admin/collectors/${s.collectorId}/approve`).set(auth(s.admin)).send({});
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'DOCUMENTS_INCOMPLETE');
  });

  it('collector uploads documents; non-images are rejected', async () => {
    const fake = await api
      .post('/api/collector/documents')
      .set(auth(s.collector))
      .attach('nationalId', Buffer.from('<script>alert(1)</script>'), { filename: 'id.png', contentType: 'image/png' });
    assert.equal(fake.status, 400);
    assert.equal(fake.body.error.code, 'INVALID_IMAGE');

    const res = await api
      .post('/api/collector/documents')
      .set(auth(s.collector))
      .attach('nationalId', PNG, { filename: 'id.png', contentType: 'image/png' })
      .attach('criminalRecord', PNG, { filename: 'record.png', contentType: 'image/png' })
      .attach('faceId', PNG, { filename: 'face.png', contentType: 'image/png' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.complete, true);
  });

  it('admin approves the collector and assigns both companies for today', async () => {
    const approve = await api.patch(`/api/admin/collectors/${s.collectorId}/approve`).set(auth(s.admin)).send({ monthlyCompanyTarget: 20 });
    assert.equal(approve.status, 200);

    const companies = await api.get('/api/admin/companies').set(auth(s.admin));
    assert.equal(companies.status, 200);
    s.idA = companies.body.data.find((c) => c.companyName === 'Gulf Factory').id;
    s.idB = companies.body.data.find((c) => c.companyName === 'Cairo Print House').id;

    const today = todayLocal();
    const mk = (companyId, timeSlot) =>
      api.post('/api/admin/pickups').set(auth(s.admin)).send({ companyId, collectorId: s.collectorId, scheduledDate: today, timeSlot });
    const a = await mk(s.idA, '09:00');
    const b = await mk(s.idB, '11:00');
    assert.equal(a.status, 201, JSON.stringify(a.body));
    assert.equal(b.status, 201);
    s.pickupA = a.body.data.id;
    s.pickupB = b.body.data.id;

    const dup = await mk(s.idA, '09:00');
    assert.equal(dup.status, 409);
  });

  it('company dashboard shows contract, target, wallet and the QR for the next pickup', async () => {
    const res = await api.get('/api/company/dashboard').set(auth(s.companyA));
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const d = res.body.data;
    assert.equal(d.companyName, 'Gulf Factory');
    assert.equal(d.contract.durationMonths, 6);
    assert.ok(d.contract.daysRemaining > 170 && d.contract.daysRemaining <= 184);
    assert.equal(d.target.collectedKg, 0);
    assert.equal(d.pointsWallet, 0);
    assert.equal(d.nextPickup.timeSlot, '09:00');
    assert.equal(d.nextPickup.collectorName, 'Test Person 3');
    assert.match(d.nextPickup.qrToken, /^[a-f0-9]{32}$/);
    s.qrA = d.nextPickup.qrToken;

    s.qrB = (await api.get('/api/company/dashboard').set(auth(s.companyB))).body.data.nextPickup.qrToken;
    assert.notEqual(s.qrA, s.qrB);
  });

  it('smart route orders stops nearest-first using $geoNear', async () => {
    const near = await api.get(`/api/collector/smartroute?lng=${AT_A.lng}&lat=${AT_A.lat}`).set(auth(s.collector));
    assert.equal(near.status, 200, JSON.stringify(near.body));
    assert.deepEqual(near.body.data.stops.map((x) => x.companyName), ['Gulf Factory', 'Cairo Print House']);
    assert.ok(near.body.data.stops[0].distanceMeters < near.body.data.stops[1].distanceMeters);
    assert.deepEqual(near.body.data.progress, { completedCompaniesThisMonth: 0, monthlyCompanyTarget: 20 });

    const far = await api.get(`/api/collector/smartroute?lng=${AT_B.lng}&lat=${AT_B.lat}`).set(auth(s.collector));
    assert.deepEqual(far.body.data.stops.map((x) => x.companyName), ['Cairo Print House', 'Gulf Factory']);
  });

  it('NEG-02: wrong QR, missing scale photo and a fake image are all rejected', async () => {
    const items = [{ trashType: 'plastic', weightKg: 45 }];
    const wrongQr = await completeBody(s.pickupA, s.collector, s.qrB, items);
    assert.equal(wrongQr.status, 400);
    assert.equal(wrongQr.body.error.code, 'INVALID_QR_HANDSHAKE');

    const noPhoto = await completeBody(s.pickupA, s.collector, s.qrA, items, null);
    assert.equal(noPhoto.status, 400);
    assert.equal(noPhoto.body.error.code, 'MISSING_SCALE_PHOTO');

    const fakeImg = await completeBody(s.pickupA, s.collector, s.qrA, items, Buffer.from('not an image'));
    assert.equal(fakeImg.status, 400);
    assert.equal(fakeImg.body.error.code, 'INVALID_IMAGE');

    const badItems = await completeBody(s.pickupA, s.collector, s.qrA, [{ trashType: 'wood', weightKg: 5 }]);
    assert.equal(badItems.status, 400);
    assert.equal(badItems.body.error.code, 'VALIDATION_ERROR');

    const list = await api.get('/api/admin/pickups?status=SCHEDULED').set(auth(s.admin));
    assert.ok(list.body.data.some((p) => p.id === s.pickupA), 'pickup must still be SCHEDULED');
  });

  it('an unapproved collector is blocked (403); an approved one still cannot touch another collector\'s pickup (404)', async () => {
    const other = await registerCollector(4);
    const otherToken = other.body.data.token;

    const blocked = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(otherToken)).send(AT_B);
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.error.code, 'COLLECTOR_NOT_APPROVED');

    await api
      .post('/api/collector/documents')
      .set(auth(otherToken))
      .attach('nationalId', PNG, { filename: 'a.png', contentType: 'image/png' })
      .attach('criminalRecord', PNG, { filename: 'b.png', contentType: 'image/png' })
      .attach('faceId', PNG, { filename: 'c.png', contentType: 'image/png' });
    const pending = await api.get('/api/admin/collectors?status=pending').set(auth(s.admin));
    assert.equal(pending.body.data.length, 1);
    const approve = await api.patch(`/api/admin/collectors/${pending.body.data[0].id}/approve`).set(auth(s.admin)).send({});
    assert.equal(approve.status, 200);

    const res = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(otherToken)).send(AT_B);
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'PICKUP_NOT_FOUND');
  });

  it('success case: scan QR + weights + scale photo -> PENDING_REVIEW, company stats unchanged', async () => {
    const items = [
      { trashType: 'plastic', weightKg: 45 },
      { trashType: 'metal', weightKg: 15 },
    ];
    const res = await completeBody(s.pickupA, s.collector, s.qrA, items);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.status, 'PENDING_REVIEW');
    assert.equal(res.body.data.totalWeightKg, 60);

    const again = await completeBody(s.pickupA, s.collector, s.qrA, items);
    assert.equal(again.status, 409);
    assert.equal(again.body.error.code, 'PICKUP_NOT_SCHEDULED');

    const dash = await api.get('/api/company/dashboard').set(auth(s.companyA));
    assert.equal(dash.body.data.target.collectedKg, 0, 'weight counts only after admin approval');
    assert.equal(dash.body.data.pointsWallet, 0);
  });

  it('only an admin can approve; approval updates weight, level and wallet (with target bonus)', async () => {
    await Company.updateOne({ companyName: 'Gulf Factory' }, { monthlyTargetKg: 50 });

    const asCompany = await api.post(`/api/admin/pickups/${s.pickupA}/approve`).set(auth(s.companyA));
    assert.equal(asCompany.status, 403);
    const asCollector = await api.post(`/api/admin/pickups/${s.pickupA}/approve`).set(auth(s.collector));
    assert.equal(asCollector.status, 403);

    const res = await api.post(`/api/admin/pickups/${s.pickupA}/approve`).set(auth(s.admin));
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.status, 'COMPLETED');
    assert.equal(res.body.data.pointsAwarded, 800); // 60 kg * 10 + 200 bonus for crossing the 50 kg target
    assert.equal(res.body.data.bonusPoints, 200);
    assert.equal(res.body.data.monthCollectedKg, 60);
    assert.equal(res.body.data.targetLevel, 'Silver');

    const again = await api.post(`/api/admin/pickups/${s.pickupA}/approve`).set(auth(s.admin));
    assert.equal(again.status, 409);
    assert.equal(again.body.error.code, 'PICKUP_NOT_PENDING');

    const dash = await api.get('/api/company/dashboard').set(auth(s.companyA));
    assert.equal(dash.body.data.target.collectedKg, 60);
    assert.equal(dash.body.data.target.level, 'Silver');
    assert.equal(dash.body.data.pointsWallet, 800);
    assert.equal(dash.body.data.nextPickup, null);
  });

  it('collector progress counts the served company', async () => {
    const res = await api.get(`/api/collector/smartroute?lng=${AT_B.lng}&lat=${AT_B.lat}`).set(auth(s.collector));
    assert.equal(res.body.data.progress.completedCompaniesThisMonth, 1);
    assert.equal(res.body.data.stops.length, 1);
  });

  it('scale photos are served to admins only', async () => {
    const list = await api.get('/api/admin/pickups?status=COMPLETED').set(auth(s.admin));
    const name = list.body.data[0].scalePhoto;
    assert.match(name, /^[a-f0-9]{32}\.png$/);

    const adminRes = await api.get(`/api/files/${name}`).set(auth(s.admin));
    assert.equal(adminRes.status, 200);
    assert.match(adminRes.headers['content-type'], /image\/png/);

    assert.equal((await api.get(`/api/files/${name}`).set(auth(s.companyA))).status, 403);
    assert.equal((await api.get(`/api/files/${name}`)).status, 401);
    assert.equal((await api.get('/api/files/..%2f..%2fetc%2fpasswd').set(auth(s.admin))).status, 404);
  });

  it('NEG-04 failure path: a no-show reported from far away is rejected, from the company is accepted', async () => {
    const far = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(s.collector)).send(AT_A);
    assert.equal(far.status, 400);
    assert.equal(far.body.error.code, 'GPS_VERIFICATION_FAILED');
    assert.ok(far.body.error.details.distanceMeters > 100000);

    const missing = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(s.collector)).send({});
    assert.equal(missing.status, 400);

    const near = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(s.collector)).send({ lng: AT_B.lng + 0.001, lat: AT_B.lat });
    assert.equal(near.status, 200, JSON.stringify(near.body));
    assert.equal(near.body.data.status, 'NO_SHOW');

    const again = await api.post(`/api/pickups/${s.pickupB}/no-show`).set(auth(s.collector)).send(AT_B);
    assert.equal(again.status, 409);
  });

  it('admin stats summarize the month', async () => {
    const res = await api.get('/api/admin/stats').set(auth(s.admin));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.companiesServed, 1);
    assert.equal(res.body.data.completedPickups, 1);
    assert.equal(res.body.data.totalWeightKg, 60);
    assert.deepEqual(res.body.data.weightByType, { plastic: 45, metal: 15 });
    assert.equal(res.body.data.noShows, 1);
    assert.equal(res.body.data.activeOrders, 0);
  });

  it('admin can change package price and discount; a company cannot', async () => {
    const denied = await api.put(`/api/admin/packages/${s.packageId}`).set(auth(s.companyA)).send({ priceEGP: 1 });
    assert.equal(denied.status, 403);
    const res = await api.put(`/api/admin/packages/${s.packageId}`).set(auth(s.admin)).send({ priceEGP: 3000, discountPercent: 15 });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.priceEGP, 3000);
    const invalid = await api.put(`/api/admin/packages/${s.packageId}`).set(auth(s.admin)).send({ discountPercent: 150 });
    assert.equal(invalid.status, 400);
  });
});
