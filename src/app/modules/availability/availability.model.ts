import { model, Schema } from "mongoose";
import { IAvailability } from "./availability.interface";

const AvailabilitySchema = new Schema<IAvailability>({
  date: { type: String, required: true, unique: true }, // unique ensures 1 record per day
  timezone: { type: String, required: true, default: "America/New_York" },
  slots: { type: [String], required: true, default: [] },
  bookingMode: { type: String, required: true, default: "EXACT_TIME" },
  serviceType: { type: String, default: "Roofing" }
}, {
  timestamps: true
});

export const Availability = model<IAvailability>("Availability", AvailabilitySchema);