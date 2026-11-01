'use strict';

const mongoose = require('mongoose');

const ROLES = ['admin', 'company', 'collector'];

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    username: { type: String, trim: true, lowercase: true }, // admin only, created by seed
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    address: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
  },
  { timestamps: true },
);

// Unique + sparse: users without an email/username (e.g. the admin) do not collide.
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
