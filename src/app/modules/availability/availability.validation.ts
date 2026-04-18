import { z } from "zod";

export const createAvailabilitySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    timezone: z.string().min(1, "Timezone is required"),
    slots: z.array(z.string()).min(1, "At least one time slot is required"),
    bookingMode: z.string().default("EXACT_TIME"),
    serviceType: z.string().optional()
});