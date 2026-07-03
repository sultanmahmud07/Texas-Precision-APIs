"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspectionSchema = exports.createInspectionSchema = void 0;
const zod_1 = require("zod");
exports.createInspectionSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(10, "Valid phone number is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().default("TX"),
    zip: zod_1.z.string().min(5, "ZIP code is required"),
    serviceType: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    scheduledDate: zod_1.z.string().min(1, "Scheduled date is required"),
    scheduledTime: zod_1.z.string().min(1, "Scheduled time is required"),
    sender: zod_1.z.enum(['DFW_ESTIMATE', 'ABILENE_INSPECTION'])
});
// For Admin updates (e.g., changing status to Confirmed)
exports.updateInspectionSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    zip: zod_1.z.string().optional(),
    serviceType: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    scheduledDate: zod_1.z.string().optional(),
    scheduledTime: zod_1.z.string().optional(),
    status: zod_1.z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']).optional(),
    sender: zod_1.z.enum(['DFW_ESTIMATE', 'ABILENE_INSPECTION']).optional()
});
