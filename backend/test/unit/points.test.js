'use strict';

require('../helpers/env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { levelFor, pointsForPickup } = require('../../src/lib/points');

test('level: Bronze below target, Silver at target, Gold at 150%', () => {
  assert.equal(levelFor(0, 250), 'Bronze');
  assert.equal(levelFor(249.99, 250), 'Bronze');
  assert.equal(levelFor(250, 250), 'Silver');
  assert.equal(levelFor(374.99, 250), 'Silver');
  assert.equal(levelFor(375, 250), 'Gold');
});

test('level: a zero target never divides by zero', () => {
  assert.equal(levelFor(100, 0), 'Bronze');
});

test('points: 10 per kg, no bonus when the target is not reached', () => {
  assert.deepEqual(pointsForPickup({ weightKg: 40, monthKgBefore: 0, targetKg: 250 }), { base: 400, bonus: 0, total: 400 });
});

test('points: bonus is added once, on the pickup that crosses the target', () => {
  // 210 kg collected so far, target 250, this pickup is 60 kg -> crosses the target
  assert.deepEqual(pointsForPickup({ weightKg: 60, monthKgBefore: 210, targetKg: 250 }), { base: 600, bonus: 200, total: 800 });
  // already above the target -> no second bonus
  assert.equal(pointsForPickup({ weightKg: 60, monthKgBefore: 270, targetKg: 250 }).bonus, 0);
});

test('points: landing exactly on the target counts as crossing it', () => {
  assert.equal(pointsForPickup({ weightKg: 50, monthKgBefore: 200, targetKg: 250 }).bonus, 200);
});
