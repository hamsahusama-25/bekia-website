'use strict';

const mongoose = require('mongoose');

const TRASH_TYPES = ['plastic', 'paper', 'glass', 'metal'];
const STATUSES = ['SCHEDULED', 'PENDING_REVIEW', 'COMPLETED', 'NO_SHOW'];

const itemSchema = new mongoose.Schema(
  {
    trashType: { type: String, enum: TRASH_TYPES, required: true },
    weightKg: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const pickupSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true, index: true },
    scheduledDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // business-timezone day
    timeSlot: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    qrToken: { type: String, required: true, unique: true },
    status: { type: String, enum: STATUSES, default: 'SCHEDULED', index: true },

    items: { type: [itemSchema], default: undefined },
    totalWeightKg: { type: Number, min: 0 },
    scalePhoto: { type: String },
    completedAt: { type: Date },

    noShow: {
      at: { type: Date },
      coordinates: { type: [Number] }, // [lng, lat] reported by the collector
      distanceMeters: { type: Number },
    },

    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedMonth: { type: String, index: true }, // 'YYYY-MM' in the business time zone
    pointsAwarded: { type: Number, min: 0 },
  },
  { timestamps: true },
);

// A company cannot be booked twice in the same slot.
pickupSchema.index({ companyId: 1, scheduledDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Pickup', pickupSchema);
module.exports.TRASH_TYPES = TRASH_TYPES;
module.exports.STATUSES = STATUSES;
