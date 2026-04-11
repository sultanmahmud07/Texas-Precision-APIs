"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, { _id: false });
const guideProfileSchema = new mongoose_1.Schema({
    expertise: [{ type: String }],
    dailyRate: { type: Number },
    languages: [{ type: String }],
    verified: { type: Boolean, default: false },
    bio: { type: String },
    photos: [{ type: String }]
}, { _id: false });
const touristProfileSchema = new mongoose_1.Schema({
    preferences: [{ type: String }],
    phone: { type: String }
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    languages: [{ type: String }],
    state: { type: String },
    address: { type: String },
    bio: { type: String },
    review_count: { type: Number, default: 0 },
    ava_rating: { type: Number },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.TOURIST
    },
    auths: [authProviderSchema],
    guideProfile: guideProfileSchema,
    touristProfile: touristProfileSchema,
    // reviews: { type: Schema.Types.ObjectId, ref: "Review"},
}, {
    timestamps: true,
    versionKey: false
});
exports.User = (0, mongoose_1.model)("User", userSchema);
