'use strict';

const mongoose = require('mongoose');

const VISIT_FREQUENCIES = ['twice_weekly', 'weekly', 'biweekly', 'monthly'];

const companySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    visitFrequency: { type: String, enum: VISIT_FREQUENCIES, required: true },
    contractStartDate: { type: Date, required: true },
    contractEndDate: { type: Date, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    monthlyTargetKg: { type: Number, default: 200, min: 0 },
    pointsWallet: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Powers $geoNear for the smart route.
companySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Company', companySchema);
module.exports.VISIT_FREQUENCIES = VISIT_FREQUENCIES;
