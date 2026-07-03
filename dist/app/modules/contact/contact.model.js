"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
const contactSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
}, { timestamps: true });
exports.Contact = (0, mongoose_1.model)("Contact", contactSchema);
