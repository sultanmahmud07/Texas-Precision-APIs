"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, "Street address is required"),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().default("TX"),
    zip: zod_1.z.string().min(5, "Please enter a valid ZIP code with at least 5 characters"),
    type: zod_1.z.string().min(1, "Page type is required")
});
exports.updateAddressSchema = zod_1.z.object({
    street: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    zip: zod_1.z.string().min(5).optional(),
    type: zod_1.z.string().optional()
});
