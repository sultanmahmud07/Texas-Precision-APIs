import { Schema, model } from "mongoose";
import { IContact } from "./contact.interface";

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    message: { type: String, required: true },
    inquiryType: { 
        type: String, 
        enum: ["PRODUCT", "GENERAL"], 
        required: true, 
        default: "GENERAL" 
    },
    products: [
        { 
            type: Schema.Types.ObjectId, 
            ref: "Product" 
        }
    ],
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", contactSchema);