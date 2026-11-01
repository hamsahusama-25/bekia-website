'use strict';

// These tests need no database: authentication, role checks and validation all run before any query.
require('../helpers/env');
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { createApp } = require('../../src/app');

const app = createApp();
const tokenFor = (role, opts = {}) =>
  jwt.sign({ sub: '507f1f77bcf86cd799439011', role }, process.env.JWT_SECRET, { algorithm: 'HS256', ...opts });

const person = {
  fullname: 'Ahmed Sami',
  email: 'a@example.com',
  phone: '+201011111111',
  age: 30,
  address: '12 Industrial Zone',
  password: 'EcoLoop@2026',
};

test('every response carries an X-Request-Id, and a safe client-supplied one is reused', async () => {
  const generated = await request(app).get('/api/health');
  assert.match(generated.headers['x-request-id'], /^[\w-]{8,64}$/);
  const reused = await request(app).get('/api/health').set('X-Request-Id', 'client-req-12345');
  assert.equal(reused.headers['x-request-id'], 'client-req-12345');
  const unsafe = await request(app).get('/api/health').set('X-Request-Id', 'bad id\twith spaces');
  assert.notEqual(unsafe.headers['x-request-id'], 'bad id\twith spaces');
});

test('health: 503 with the standard error envelope when MongoDB is not connected', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 503);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error.code, 'DB_UNAVAILABLE');
  assert.equal(res.body.requestId, res.headers['x-request-id']);
});

test('NEG-01: registering with role "admin" is rejected with 400 VALIDATION_ERROR', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...person, role: 'admin' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('register/login: malformed or missing bodies are 400, never 500', async () => {
  assert.equal((await request(app).post('/api/auth/register')).status, 400);
  assert.equal((await request(app).post('/api/auth/login').send({})).status, 400);
  const badJson = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{oops');
  assert.equal(badJson.status, 400);
  assert.equal(badJson.body.error.code, 'INVALID_JSON');
});

test('login: NoSQL operator payload is rejected before reaching the database', async () => {
  const res = await request(app).post('/api/auth/login').send({ identifier: { $ne: '' }, password: { $ne: '' } });
  assert.equal(res.status, 400);
});

test('protected routes: no token -> 401 UNAUTHORIZED', async () => {
  for (const path of ['/api/company/dashboard', '/api/collector/smartroute', '/api/admin/stats', '/api/files/x']) {
    const res = await request(app).get(path);
    assert.equal(res.status, 401, path);
    assert.equal(res.body.error.code, 'UNAUTHORIZED', path);
  }
});

test('protected routes: garbage, wrong-secret, expired and alg=none tokens -> 401 INVALID_TOKEN', async () => {
  const bad = [
    'garbage',
    jwt.sign({ sub: 'x', role: 'admin' }, 'another-secret'),
    tokenFor('admin', { expiresIn: -10 }),
    `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"sub":"x","role":"admin"}').toString('base64url')}.`,
  ];
  for (const t of bad) {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'INVALID_TOKEN');
  }
});

test('NEG-03: a valid token with the wrong role -> 403 FORBIDDEN_ROLE', async () => {
  const cases = [
    ['collector', 'post', '/api/admin/pickups/507f1f77bcf86cd799439011/approve'],
    ['company', 'get', '/api/admin/stats'],
    ['company', 'get', '/api/collector/smartroute'],
    ['collector', 'get', '/api/company/dashboard'],
    ['company', 'post', '/api/pickups/507f1f77bcf86cd799439011/no-show'],
    ['collector', 'get', '/api/files/0123456789abcdef0123456789abcdef.jpg'],
  ];
  for (const [role, method, path] of cases) {
    const res = await request(app)[method](path).set('Authorization', `Bearer ${tokenFor(role)}`);
    assert.equal(res.status, 403, `${role} ${method} ${path}`);
    assert.equal(res.body.error.code, 'FORBIDDEN_ROLE');
  }
});

test('unknown routes return the JSON error envelope', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
});

test('security headers are present and the framework is not advertised', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.headers['x-powered-by'], undefined);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
});
