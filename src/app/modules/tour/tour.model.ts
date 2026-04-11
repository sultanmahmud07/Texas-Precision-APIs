import { Schema, model } from "mongoose";
import { ITour } from "./tour.interface";

const tourSchema = new Schema<ITour>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true, index: true },

  description: { type: String, required: true },

  thumbnail: { type: String },
  images: { type: [String], default: [] },
  deleteImages: { type: [String], default: [] },
  fee: { type: Number, required: true, min: 0 },
  childFee: { type: Number, min: 0 },

  durationHours: { type: Number, required: true, min: 0 },
  meetingPoint: { type: String},
  maxGroupSize: { type: Number, required: true, min: 1 },

  transportationMode: {
    type: String,
    enum: ["Walking", "Biking", "Private Transport", "Public Transport", "Other"],
  },

  startTime: { type: [String], default: [] }, // e.g. ["09:00", "14:30"]
  itinerary: { type: [String], default: [] },
  importantPoints: { type: [String], default: [] },
  cancellationPolicy: { type: [String], default: [] },

  inclusionsAndExclusions: {
    type: {
      inclusions: { type: [String], default: [] },
      exclusions: { type: [String], default: [] },
    },
    default: { inclusions: [], exclusions: [] },
  },

  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviews: { type: Schema.Types.ObjectId, ref: "Review"},

  language: {
    type: String,
    enum: ["English", "Spanish", "French", "German", "Other"],
    default: "English"
  },

  category: {
    type: String,
    enum: ["Food", "Art", "Adventure", "History", "Nature", "Other"],
  },

  destinationCity: { type: String, required: true },

  isActive: { type: Boolean, default: true },

  status: {
    type: String,
    enum: ["PUBLIC", "PRIVATE", "HOLD", "SUSPENDED"],
    default: "PUBLIC",
  },
}, {
  timestamps: true,
  versionKey: false,
});

export const Tour = model<ITour>("Tour", tourSchema);
