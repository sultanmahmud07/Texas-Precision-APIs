import { z } from "zod";

export const createAddressSchema = z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().default("TX"),
    zip: z.string().min(5, "Please enter a valid ZIP code with at least 5 characters"),
    type: z.string().min(1, "Page type is required")
});

export const updateAddressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().min(5).optional(),
    type: z.string().optional()
});