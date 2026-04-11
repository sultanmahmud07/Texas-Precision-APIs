"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String },
    description: { type: String },
    visibility: { type: Boolean, default: true },
    order: { type: Number }
}, {
    timestamps: true
});
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
