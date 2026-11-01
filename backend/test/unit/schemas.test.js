'use strict';

require('../helpers/env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema, loginSchema, completePickupSchema, routeQuerySchema } = require('../../src/schemas');

const person = {
  fullname: 'Ahmed Sami',
  email: 'Ahmed@Example.com',
  phone: '+201011111111',
  age: 30,
  address: '12 Industrial Zone',
  password: 'EcoLoop@2026',
};
const company = {
  ...person,
  role: 'company',
  companyName: 'Gulf Factory',
  category: 'factory',
  companyAddress: 'Industrial Zone, Suez',
  packageId: '507f1f77bcf86cd799439011',
  visitFrequency: 'weekly',
  location: { lng: 32.5498, lat: 29.9668 },
};

test('register: valid company and collector payloads pass; email is lower-cased', () => {
  const c = registerSchema.parse(company);
  assert.equal(c.email, 'ahmed@example.com');
  assert.equal(registerSchema.parse({ ...person, role: 'collector' }).role, 'collector');
});

test('register: role "admin" is rejected (no public admin registration)', () => {
  assert.equal(registerSchema.safeParse({ ...person, role: 'admin' }).success, false);
});

test('register: missing role, short password, minor age and bad package id are rejected', () => {
  assert.equal(registerSchema.safeParse(person).success, false);
  assert.equal(registerSchema.safeParse({ ...company, password: 'short' }).success, false);
  assert.equal(registerSchema.safeParse({ ...company, age: 17 }).success, false);
  assert.equal(registerSchema.safeParse({ ...company, packageId: 'not-an-id' }).success, false);
  assert.equal(registerSchema.safeParse({ ...company, packageId: { $ne: null } }).success, false);
});

test('register: company needs a valid visit frequency and coordinates', () => {
  assert.equal(registerSchema.safeParse({ ...company, visitFrequency: 'daily' }).success, false);
  assert.equal(registerSchema.safeParse({ ...company, location: { lng: 200, lat: 0 } }).success, false);
});

test('register: extra fields such as isApprovedByAdmin are stripped, not passed through', () => {
  const parsed = registerSchema.parse({ ...person, role: 'collector', isApprovedByAdmin: true });
  assert.equal('isApprovedByAdmin' in parsed, false);
});

test('login: operators instead of strings (NoSQL injection attempt) are rejected', () => {
  assert.equal(loginSchema.safeParse({ identifier: { $ne: '' }, password: { $ne: '' } }).success, false);
  assert.equal(loginSchema.safeParse({ identifier: 'ahmed@example.com', password: 'x' }).success, true);
});

test('complete pickup: trash type must be one of the four, weight must be positive', () => {
  const ok = { qrToken: 'a'.repeat(32), items: [{ trashType: 'plastic', weightKg: 45 }] };
  assert.equal(completePickupSchema.safeParse(ok).success, true);
  assert.equal(completePickupSchema.safeParse({ ...ok, items: [{ trashType: 'wood', weightKg: 5 }] }).success, false);
  assert.equal(completePickupSchema.safeParse({ ...ok, items: [{ trashType: 'glass', weightKg: 0 }] }).success, false);
  assert.equal(completePickupSchema.safeParse({ ...ok, items: [] }).success, false);
});

test('route query: coordinates are coerced from strings and range-checked', () => {
  assert.deepEqual(routeQuerySchema.parse({ lng: '32.5', lat: '29.9' }), { lng: 32.5, lat: 29.9 });
  assert.equal(routeQuerySchema.safeParse({ lng: '32.5', lat: '999' }).success, false);
  assert.equal(routeQuerySchema.safeParse({ lng: 'abc', lat: '1' }).success, false);
});
