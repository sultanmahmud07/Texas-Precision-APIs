import { z } from "zod";
import { BOOKING_STATUS } from "./booking.interface";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createBookingZodSchema = z.object({
  tour: z.string().min(1, { message: "Tour id is required" }),
  guide: z.string().min(1, { message: "Guide id is required" }),
  date: z
    .string()
    .regex(dateRegex, { message: "Date must be in YYYY-MM-DD format" })
    .refine((v) => {
      // treat midnight local time — allow booking for today or future only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(v + "T00:00:00");
      return d >= today;
    }, { message: "Date must be today or in the future" }),
  time: z.string(),
  groupSize: z
    .union([z.number().int().min(1), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
      }
      return v ?? 1;
    }),
  phone: z.string().min(1, { message: "Number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  paymentUrl: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const updateBookingStatusZodSchema = z.object({
    status: z.enum(Object.values(BOOKING_STATUS) as [string]),
});
