import z from "zod";
import { IsActive, Role } from "./user.interface";

const phoneRegex = /^(?:\+?\d{7,15})$/; // generic phone validation

export const createUserZodSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5).max(100),
  password: z.string()
    .min(8, "Password must be at least 8 chars")
    .regex(/(?=.*[A-Z])/, "Must include uppercase")
    .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
    .regex(/(?=.*\d)/, "Must include number"),
  phone: z.string().regex(phoneRegex).optional(),
  address: z.string().max(300).optional(),
  // role allowed only for admin-created users; public register will ignore it in service
  role: z.nativeEnum(Role).optional(),
  guideProfile: z.object({
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().positive().optional(),
    languages: z.array(z.string()).optional(),
    bio: z.string().max(1000).optional(),
    photos: z.array(z.string().url()).optional()
  }).optional(),
  touristProfile: z.object({
    preferences: z.array(z.string()).optional(),
    phone: z.string().regex(phoneRegex).optional()
  }).optional()
});

export const updateUserZodSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string()
    .min(8)
    .regex(/(?=.*[A-Z])/, "Must include uppercase")
    .regex(/(?=.*[!@#$%^&*])/, "Must include special char")
    .regex(/(?=.*\d)/, "Must include number")
    .optional(),
  phone: z.string().regex(phoneRegex).optional(),
  address: z.string().max(300).optional(),
  state: z.string().max(30).optional(),
  isFeatured: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.nativeEnum(IsActive).optional(),
  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  guideProfile: z.object({
    expertise: z.array(z.string()).optional(),
    dailyRate: z.number().positive().optional(),
    languages: z.array(z.string()).optional(),
    bio: z.string().max(1000).optional(),
    photos: z.array(z.string().url()).optional()
  }).optional(),
  touristProfile: z.object({
    preferences: z.array(z.string()).optional(),
    phone: z.string().regex(phoneRegex).optional()
  }).optional()
});
