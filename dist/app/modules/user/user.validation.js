"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
const phoneRegex = /^(?:\+?\d{7,15})$/; // generic phone validation
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(2).max(100),
    email: zod_1.default.string().email().min(5).max(100),
    password: zod_1.default.string()
        .min(8, "Password must be at least 8 chars")
        .regex(/(?=.*[A-Z])/, "Must include uppercase")
        .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
        .regex(/(?=.*\d)/, "Must include number"),
    phone: zod_1.default.string().regex(phoneRegex).optional(),
    address: zod_1.default.string().max(300).optional(),
    // role allowed only for admin-created users; public register will ignore it in service
    role: zod_1.default.nativeEnum(user_interface_1.Role).optional(),
    guideProfile: zod_1.default.object({
        expertise: zod_1.default.array(zod_1.default.string()).optional(),
        dailyRate: zod_1.default.number().positive().optional(),
        languages: zod_1.default.array(zod_1.default.string()).optional(),
        bio: zod_1.default.string().max(1000).optional(),
        photos: zod_1.default.array(zod_1.default.string().url()).optional()
    }).optional(),
    touristProfile: zod_1.default.object({
        preferences: zod_1.default.array(zod_1.default.string()).optional(),
        phone: zod_1.default.string().regex(phoneRegex).optional()
    }).optional()
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(2).max(100).optional(),
    password: zod_1.default.string()
        .min(8)
        .regex(/(?=.*[A-Z])/, "Must include uppercase")
        .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
        .regex(/(?=.*\d)/, "Must include number")
        .optional(),
    phone: zod_1.default.string().regex(phoneRegex).optional(),
    address: zod_1.default.string().max(300).optional(),
    state: zod_1.default.string().max(30).optional(),
    isFeatured: zod_1.default.boolean().optional(),
    languages: zod_1.default.array(zod_1.default.string()).optional(),
    bio: zod_1.default.string().optional(),
    role: zod_1.default.nativeEnum(user_interface_1.Role).optional(),
    isActive: zod_1.default.nativeEnum(user_interface_1.IsActive).optional(),
    isDeleted: zod_1.default.boolean().optional(),
    isVerified: zod_1.default.boolean().optional(),
    guideProfile: zod_1.default.object({
        expertise: zod_1.default.array(zod_1.default.string()).optional(),
        dailyRate: zod_1.default.number().positive().optional(),
        languages: zod_1.default.array(zod_1.default.string()).optional(),
        bio: zod_1.default.string().max(1000).optional(),
        photos: zod_1.default.array(zod_1.default.string().url()).optional()
    }).optional(),
    touristProfile: zod_1.default.object({
        preferences: zod_1.default.array(zod_1.default.string()).optional(),
        phone: zod_1.default.string().regex(phoneRegex).optional()
    }).optional()
});
