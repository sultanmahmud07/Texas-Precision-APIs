"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const booking_interface_1 = require("./booking.interface");
const payment_interface_1 = require("../payment/payment.interface");
const bookingSchema = new mongoose_1.Schema({
    tour: { type: mongoose_1.Schema.Types.ObjectId, ref: "Tour", required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    guide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    groupSize: { type: Number, required: true },
    phone: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    paymentUrl: { type: String },
    notes: { type: String },
    payment: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
    review: { type: mongoose_1.Schema.Types.ObjectId, ref: "Review" },
    paymentStatus: {
        type: String,
        enum: payment_interface_1.PAYMENT_STATUS,
        default: payment_interface_1.PAYMENT_STATUS.UNPAID
    },
    status: {
        type: String,
        enum: booking_interface_1.BOOKING_STATUS,
        default: booking_interface_1.BOOKING_STATUS.PENDING
    },
    statusLogs: [
        {
            status: String,
            updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, {
    timestamps: true,
});
exports.Booking = mongoose_1.default.model("Booking", bookingSchema);
