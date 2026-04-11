"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    thumbnail: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    visibility: zod_1.z.boolean().optional(),
    order: zod_1.z.number().optional()
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    thumbnail: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    visibility: zod_1.z.boolean().default(true),
    order: zod_1.z.number().optional()
});
