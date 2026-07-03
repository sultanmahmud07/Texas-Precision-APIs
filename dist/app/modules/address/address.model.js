"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: "TX" }, // Defaulted to TX based on your UI
    zip: { type: String, required: true, unique: true }, // Unique constraint added
    type: { type: String, required: true } // To track which page it came from
}, {
    timestamps: true
});
exports.Address = (0, mongoose_1.model)("Address", AddressSchema);
