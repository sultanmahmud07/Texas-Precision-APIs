import { model, Schema } from "mongoose";
import { IAddress } from "./address.interface";

const AddressSchema = new Schema<IAddress>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: "TX" }, // Defaulted to TX based on your UI
    zip: { type: String, required: true, unique: true },    // Unique constraint added
    type: { type: String, required: true }                  // To track which page it came from
}, {
    timestamps: true
});

export const Address = model<IAddress>("Address", AddressSchema);