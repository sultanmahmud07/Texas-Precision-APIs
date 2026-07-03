"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAvailabilitySchema = void 0;
const zod_1 = require("zod");
const availabilityObjectSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    timezone: zod_1.z.string().min(1, "Timezone is required"),
    slots: zod_1.z.array(zod_1.z.string()).min(1, "At least one time slot is required"),
    bookingMode: zod_1.z.string().default("EXACT_TIME"),
    serviceType: zod_1.z.string().optional()
});
exports.createAvailabilitySchema = zod_1.z.object({
    // We expect an object that contains an array called "schedules"
    schedules: zod_1.z.array(availabilityObjectSchema).min(1, "Provide at least one day of availability")
});
