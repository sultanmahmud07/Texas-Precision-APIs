"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusZodSchema = exports.createBookingZodSchema = void 0;
const zod_1 = require("zod");
const booking_interface_1 = require("./booking.interface");
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
exports.createBookingZodSchema = zod_1.z.object({
    tour: zod_1.z.string().min(1, { message: "Tour id is required" }),
    guide: zod_1.z.string().min(1, { message: "Guide id is required" }),
    date: zod_1.z
        .string()
        .regex(dateRegex, { message: "Date must be in YYYY-MM-DD format" })
        .refine((v) => {
        // treat midnight local time — allow booking for today or future only
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(v + "T00:00:00");
        return d >= today;
    }, { message: "Date must be today or in the future" }),
    time: zod_1.z.string(),
    groupSize: zod_1.z
        .union([zod_1.z.number().int().min(1), zod_1.z.string()])
        .optional()
        .transform((v) => {
        if (typeof v === "string") {
            const n = Number(v);
            return Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
        }
        return v !== null && v !== void 0 ? v : 1;
    }),
    phone: zod_1.z.string().min(1, { message: "Number is required" }),
    address: zod_1.z.string().min(1, { message: "Address is required" }),
    paymentUrl: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.updateBookingStatusZodSchema = zod_1.z.object({
    status: zod_1.z.enum(Object.values(booking_interface_1.BOOKING_STATUS)),
});
