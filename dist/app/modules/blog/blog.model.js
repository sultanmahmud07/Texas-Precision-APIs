"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
// src/app/modules/blog/blog.model.ts
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    reference: { type: String, required: true, lowercase: true },
    category: String,
    metaTitle: String,
    metaDescription: String,
    description: { type: String, required: true },
    readTime: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    keywords: [{ type: String }],
    relevantKeywords: [{ type: String }],
    focusingKeyword: { type: String },
    content: { type: String, required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    thumbnail: String,
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
}, { timestamps: true });
exports.Blog = (0, mongoose_1.model)("Blog", blogSchema);
