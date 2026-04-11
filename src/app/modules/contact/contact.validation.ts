import { z } from "zod";

export const createContactZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    inquiryType: z.enum(["PRODUCT", "GENERAL"]),
    products: z.array(z.string()).optional(), 
});