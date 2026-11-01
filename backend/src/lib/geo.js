'use strict';

const EARTH_RADIUS_M = 6371008.8;
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in meters between two GeoJSON-style [lng, lat] pairs.
 */
function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Builds the aggregation that orders the given companies from nearest to farthest.
 * $geoNear must be the first stage and relies on the 2dsphere index on Company.location.
 */
function buildSmartRoutePipeline({ companyIds, lng, lat }) {
  return [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        spherical: true,
        query: { _id: { $in: companyIds } },
      },
    },
    { $project: { companyName: 1, category: 1, address: 1, location: 1, distanceMeters: 1 } },
  ];
}

module.exports = { haversineMeters, buildSmartRoutePipeline };
