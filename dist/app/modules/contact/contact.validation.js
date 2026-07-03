"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactZodSchema = void 0;
const zod_1 = require("zod");
exports.createContactZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().optional(),
    message: zod_1.z.string().min(1, "Message is required"),
    inquiryType: zod_1.z.enum(["PRODUCT", "GENERAL"]),
    products: zod_1.z.array(zod_1.z.string()).optional(),
});
