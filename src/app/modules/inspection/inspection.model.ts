import { model, Schema } from "mongoose";
import { IInspection } from "./inspection.interface";

const InspectionSchema = new Schema<IInspection>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true, default: "TX" },
  zip: { type: String, required: true },
  serviceType: { type: String }, // Optional
  notes: { type: String },       // Optional
  scheduledDate: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  sender: {
    type: String,
    enum: ['DFW_ESTIMATE', 'ABILENE_INSPECTION'],
    required: true
  }
}, {
  timestamps: true
});

export const Inspection = model<IInspection>("Inspection", InspectionSchema);