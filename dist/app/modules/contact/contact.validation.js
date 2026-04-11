"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactValidation = void 0;
const zod_1 = require("zod");
exports.createContactValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email({ message: "Invalid email address" }),
        phone: zod_1.z.string().min(10, { message: "Phone must be at least 10 digits" }),
        message: zod_1.z.string().optional(),
    }),
});
