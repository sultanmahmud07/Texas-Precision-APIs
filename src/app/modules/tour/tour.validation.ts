/* eslint-disable @typescript-eslint/no-explicit-any */
import z from "zod";

// helper preprocessors
const toNumber = (val: any) => {
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }
  return val;
};

const toStringArray = (val: any) => {
  // Accept JSON string or comma-separated or array
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    // Attempt JSON parse first
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON
    }
    // comma separated fallback
    if (trimmed === "") return [];
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const createTourZodSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(3, "Title is too short"),
  slug: z.string({ required_error: "Slug is required" }).min(3, "Slug is too short"),
  description: z.string({ required_error: "Description is required" }).min(10, "Description is too short"),

  // images handled by multer (thumbnail/images) — not validated here

  fee: z.preprocess(toNumber, z.number({ required_error: "Fee required" }).nonnegative("Fee must be >= 0")),
  childFee: z.preprocess(toNumber, z.number().nonnegative().optional()),
  durationHours: z.preprocess(toNumber, z.number({ required_error: "Duration required" }).positive("Duration must be > 0")),

  meetingPoint: z.string().optional(),
  maxGroupSize: z.preprocess(toNumber, z.number({ required_error: "Max group size required" }).int().positive("Max group size must be >= 1")),

  transportationMode: z.enum([
    "Walking",
    "Biking",
    "Private Transport",
    "Public Transport",
    "Other"
  ]).optional(),

  startTime: z.preprocess(toStringArray, z.array(z.string()).optional()),
  deleteImages: z.preprocess(toStringArray, z.array(z.string()).optional()),
  itinerary: z.preprocess(toStringArray, z.array(z.string()).optional()),
  importantPoints: z.preprocess(toStringArray, z.array(z.string()).optional()),
  cancellationPolicy: z.preprocess(toStringArray, z.array(z.string()).optional()),

  inclusionsAndExclusions: z.object({
    inclusions: z.preprocess(toStringArray, z.array(z.string()).optional()).optional(),
    exclusions: z.preprocess(toStringArray, z.array(z.string()).optional()).optional(),
  }).optional(),

  author: z.string().optional(),
  reviews: z.string().optional(),

  language: z.enum(["English", "Spanish", "French", "German", "Other"]).optional(),

  category: z.enum(["Food", "Art", "Adventure", "History", "Nature", "Other"]).optional(),

  destinationCity: z.string({ required_error: "Destination/City required" }).min(2, "Destination/City is too short"),

  isActive: z.boolean().default(true),

  status: z.enum(["PUBLIC", "PRIVATE", "HOLD", "SUSPENDED"]).optional(),
});

export const updateTourZodSchema = createTourZodSchema.partial();
