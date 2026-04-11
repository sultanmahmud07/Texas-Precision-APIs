"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourZodSchema = exports.createTourZodSchema = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const zod_1 = __importDefault(require("zod"));
// helper preprocessors
const toNumber = (val) => {
    if (typeof val === "string" && val.trim() !== "") {
        const n = Number(val);
        return Number.isNaN(n) ? val : n;
    }
    return val;
};
const toStringArray = (val) => {
    // Accept JSON string or comma-separated or array
    if (Array.isArray(val))
        return val;
    if (typeof val === "string") {
        const trimmed = val.trim();
        // Attempt JSON parse first
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch (_a) {
            // not JSON
        }
        // comma separated fallback
        if (trimmed === "")
            return [];
        return trimmed.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
};
exports.createTourZodSchema = zod_1.default.object({
    title: zod_1.default.string({ required_error: "Title is required" }).min(3, "Title is too short"),
    slug: zod_1.default.string({ required_error: "Slug is required" }).min(3, "Slug is too short"),
    description: zod_1.default.string({ required_error: "Description is required" }).min(10, "Description is too short"),
    // images handled by multer (thumbnail/images) — not validated here
    fee: zod_1.default.preprocess(toNumber, zod_1.default.number({ required_error: "Fee required" }).nonnegative("Fee must be >= 0")),
    childFee: zod_1.default.preprocess(toNumber, zod_1.default.number().nonnegative().optional()),
    durationHours: zod_1.default.preprocess(toNumber, zod_1.default.number({ required_error: "Duration required" }).positive("Duration must be > 0")),
    meetingPoint: zod_1.default.string().optional(),
    maxGroupSize: zod_1.default.preprocess(toNumber, zod_1.default.number({ required_error: "Max group size required" }).int().positive("Max group size must be >= 1")),
    transportationMode: zod_1.default.enum([
        "Walking",
        "Biking",
        "Private Transport",
        "Public Transport",
        "Other"
    ]).optional(),
    startTime: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()),
    deleteImages: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()),
    itinerary: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()),
    importantPoints: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()),
    cancellationPolicy: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()),
    inclusionsAndExclusions: zod_1.default.object({
        inclusions: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()).optional(),
        exclusions: zod_1.default.preprocess(toStringArray, zod_1.default.array(zod_1.default.string()).optional()).optional(),
    }).optional(),
    author: zod_1.default.string().optional(),
    reviews: zod_1.default.string().optional(),
    language: zod_1.default.enum(["English", "Spanish", "French", "German", "Other"]).optional(),
    category: zod_1.default.enum(["Food", "Art", "Adventure", "History", "Nature", "Other"]).optional(),
    destinationCity: zod_1.default.string({ required_error: "Destination/City required" }).min(2, "Destination/City is too short"),
    isActive: zod_1.default.boolean().default(true),
    status: zod_1.default.enum(["PUBLIC", "PRIVATE", "HOLD", "SUSPENDED"]).optional(),
});
exports.updateTourZodSchema = exports.createTourZodSchema.partial();
