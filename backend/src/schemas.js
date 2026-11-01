'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');
const { VISIT_FREQUENCIES } = require('./models/Company');
const { TRASH_TYPES } = require('./models/Pickup');

const objectId = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v) && /^[a-f0-9]{24}$/i.test(v), 'Invalid id');

const phone = z.string().trim().regex(/^\+?\d{10,15}$/, 'Phone must be 10-15 digits');

const baseUser = {
  fullname: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email().max(120),
  phone,
  age: z.number().int().min(18).max(100),
  address: z.string().trim().min(5).max(200),
  password: z.string().min(8).max(72), // 72 = bcrypt input limit
};

// "admin" is deliberately absent: there is no public admin registration.
const registerSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('company'),
    ...baseUser,
    companyName: z.string().trim().min(2).max(120),
    category: z.string().trim().min(2).max(60),
    companyAddress: z.string().trim().min(5).max(200),
    packageId: objectId,
    visitFrequency: z.enum(VISIT_FREQUENCIES),
    location: z.object({
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90),
    }),
  }),
  z.object({ role: z.literal('collector'), ...baseUser }),
]);

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120), // email, phone or admin username
  password: z.string().min(1).max(72),
});

const coordsSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

const routeQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const completePickupSchema = z.object({
  qrToken: z.string().min(8).max(128),
  items: z
    .array(
      z.object({
        trashType: z.enum(TRASH_TYPES),
        weightKg: z.number().positive().max(10000),
      }),
    )
    .min(1)
    .max(TRASH_TYPES.length),
});

const createPickupSchema = z.object({
  companyId: objectId,
  collectorId: objectId,
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

const approveCollectorSchema = z.object({
  monthlyCompanyTarget: z.number().int().min(0).max(1000).optional(),
});

const updatePackageSchema = z
  .object({
    priceEGP: z.number().min(0).optional(),
    discountPercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field');

module.exports = {
  objectId,
  registerSchema,
  loginSchema,
  coordsSchema,
  routeQuerySchema,
  completePickupSchema,
  createPickupSchema,
  approveCollectorSchema,
  updatePackageSchema,
};
