import { z } from "zod";

const productVariationSchema = z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.number().min(0),
    price: z.number().optional(),
});

const specificationSchema = z.object({
    name: z.string(),
    value: z.string(),
});

export const createProductZodSchema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    basePrice: z.number(), // Back to normal!
    category: z.string().optional(),
    bulletPoints: z.array(z.string()).optional(), // Back to normal!
    specifications: z.array(specificationSchema).optional(), // Back to normal!
    variations: z.array(productVariationSchema).min(1, "At least one variation is required"),
});

export const updateProductZodSchema = z.object({

});