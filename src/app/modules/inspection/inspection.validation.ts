import { z } from "zod";

export const createInspectionSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().default("TX"),
    zip: z.string().min(5, "ZIP code is required"),
    serviceType: z.string().optional(),
    notes: z.string().optional(),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    scheduledTime: z.string().min(1, "Scheduled time is required"),
    sender: z.enum(['DFW_ESTIMATE', 'ABILENE_INSPECTION'])
});

// For Admin updates (e.g., changing status to Confirmed)
export const updateInspectionSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    serviceType: z.string().optional(),
    notes: z.string().optional(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']).optional(),
    sender: z.enum(['DFW_ESTIMATE', 'ABILENE_INSPECTION']).optional()
});