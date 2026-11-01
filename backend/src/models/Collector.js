'use strict';

const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Stored file names (see lib/files.js). Served only to admins through /api/files/:name.
    documents: {
      nationalId: { type: String },
      criminalRecord: { type: String },
      faceId: { type: String },
    },
    isApprovedByAdmin: { type: Boolean, default: false },
    approvedAt: { type: Date },
    monthlyCompanyTarget: { type: Number, default: 30, min: 0 },
  },
  { timestamps: true },
);

collectorSchema.methods.hasAllDocuments = function hasAllDocuments() {
  const d = this.documents || {};
  return Boolean(d.nationalId && d.criminalRecord && d.faceId);
};

module.exports = mongoose.model('Collector', collectorSchema);
