"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Availability = void 0;
const mongoose_1 = require("mongoose");
const AvailabilitySchema = new mongoose_1.Schema({
    date: { type: String, required: true, unique: true }, // unique ensures 1 record per day
    timezone: { type: String, required: true, default: "America/New_York" },
    slots: { type: [String], required: true, default: [] },
    bookingMode: { type: String, required: true, default: "EXACT_TIME" },
    serviceType: { type: String, default: "Roofing" }
}, {
    timestamps: true
});
exports.Availability = (0, mongoose_1.model)("Availability", AvailabilitySchema);
