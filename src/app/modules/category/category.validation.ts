import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    thumbnail: z.string().optional(),
    description: z.string().optional(),
    visibility: z.boolean().optional(),
    order: z.number().optional()
});

export const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    thumbnail: z.string().optional(),
    description: z.string().optional(),
    visibility: z.boolean().default(true),
    order: z.number().optional()
});
