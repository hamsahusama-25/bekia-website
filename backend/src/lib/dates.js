'use strict';

const config = require('../config');

function formatParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** 'YYYY-MM-DD' in the business time zone (default Africa/Cairo). */
function todayLocal(date = new Date(), timeZone = config.appTimeZone) {
  const { year, month, day } = formatParts(date, timeZone);
  return `${year}-${month}-${day}`;
}

/** 'YYYY-MM' in the business time zone. Used to bucket monthly stats without resets. */
function monthKey(date = new Date(), timeZone = config.appTimeZone) {
  const { year, month } = formatParts(date, timeZone);
  return `${year}-${month}`;
}

function addMonths(date, months) {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

module.exports = { todayLocal, monthKey, addMonths };
