"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productVariationSchema = new mongoose_1.Schema({
    size: { type: String },
    color: { type: String },
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number },
}, { _id: false });
const specificationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bulletPoints: { type: [String], default: [] },
    description: { type: String }, // Stores your HTML string
    specifications: { type: [specificationSchema], default: [] },
    images: { type: [String], default: [] },
    deleteImages: { type: [String], default: [] },
    featureImages: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    variations: [productVariationSchema],
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category" },
}, { timestamps: true });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
