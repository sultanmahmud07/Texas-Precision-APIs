"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspection = void 0;
const mongoose_1 = require("mongoose");
const InspectionSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: "TX" },
    zip: { type: String, required: true },
    serviceType: { type: String }, // Optional
    notes: { type: String }, // Optional
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
exports.Inspection = (0, mongoose_1.model)("Inspection", InspectionSchema);
