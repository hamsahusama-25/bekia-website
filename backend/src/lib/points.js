'use strict';

const config = require('../config');

const round2 = (n) => Math.round(n * 100) / 100;

/** Bronze below target, Silver at target, Gold at 150% of target. */
function levelFor(collectedKg, targetKg) {
  if (!(targetKg > 0)) return 'Bronze';
  const ratio = collectedKg / targetKg;
  if (ratio >= config.goldAtRatio) return 'Gold';
  if (ratio >= config.silverAtRatio) return 'Silver';
  return 'Bronze';
}

/**
 * Points for one approved pickup:
 * pointsPerKg for every kg, plus a one-time bonus on the pickup that first reaches the monthly target.
 */
function pointsForPickup({ weightKg, monthKgBefore, targetKg }) {
  const base = Math.round(weightKg * config.pointsPerKg);
  const crossedTarget = targetKg > 0 && monthKgBefore < targetKg && monthKgBefore + weightKg >= targetKg;
  return { base, bonus: crossedTarget ? config.targetBonusPoints : 0, total: base + (crossedTarget ? config.targetBonusPoints : 0) };
}

module.exports = { levelFor, pointsForPickup, round2 };
