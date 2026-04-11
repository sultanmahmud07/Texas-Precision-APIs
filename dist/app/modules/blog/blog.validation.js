"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogZodSchema = exports.createBlogZodSchema = void 0;
const zod_1 = require("zod");
exports.createBlogZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title is required"),
    slug: zod_1.z.string().min(3, "Slug is required"),
    reference: zod_1.z.string().min(3, "Reference site is required"),
    category: zod_1.z.string().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    readTime: zod_1.z.number().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    relevantKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    focusingKeyword: zod_1.z.string().optional(),
    content: zod_1.z.string().min(20),
    thumbnail: zod_1.z.string().optional(),
});
// Update Product Validator
exports.updateBlogZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, "Title must be at least 2 characters").optional(),
    slug: zod_1.z.string().optional(),
    category: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID").optional(), // ObjectId validation
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    readTime: zod_1.z.number().int().positive().optional(),
    commentCount: zod_1.z.number().int().nonnegative().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    relevantKeywords: zod_1.z.array(zod_1.z.string()).optional(),
    focusingKeyword: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    thumbnail: zod_1.z.string().url("Thumbnail must be a valid URL").optional(),
    views: zod_1.z.number().int().nonnegative().optional(),
    isPublished: zod_1.z.boolean().optional(),
});
