'use strict';

require('../helpers/env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { haversineMeters, buildSmartRoutePipeline } = require('../../src/lib/geo');

test('haversine: same point is 0 meters', () => {
  assert.equal(haversineMeters([32.5498, 29.9668], [32.5498, 29.9668]), 0);
});

test('haversine: ~111 km per degree of latitude', () => {
  const d = haversineMeters([32, 29], [32, 30]);
  assert.ok(d > 111000 && d < 111400, `got ${d}`);
});

test('haversine: Suez to Cairo is roughly 120-135 km', () => {
  const d = haversineMeters([32.5498, 29.9668], [31.2357, 30.0444]);
  assert.ok(d > 120000 && d < 135000, `got ${d}`);
});

test('haversine: ~0.002 degrees of latitude is under the 500 m no-show limit', () => {
  assert.ok(haversineMeters([32.5498, 29.9668], [32.5498, 29.9688]) < 500);
});

test('smart route pipeline starts with $geoNear on the spherical index and filters company ids', () => {
  const ids = ['a', 'b'];
  const pipeline = buildSmartRoutePipeline({ companyIds: ids, lng: 32.5, lat: 29.9 });
  assert.ok(pipeline[0].$geoNear, '$geoNear must be the first stage');
  assert.equal(pipeline[0].$geoNear.spherical, true);
  assert.deepEqual(pipeline[0].$geoNear.near.coordinates, [32.5, 29.9]);
  assert.deepEqual(pipeline[0].$geoNear.query, { _id: { $in: ids } });
  assert.equal(pipeline[0].$geoNear.distanceField, 'distanceMeters');
});
