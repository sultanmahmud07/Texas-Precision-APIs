import mongoose, { Schema } from "mongoose";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { PAYMENT_STATUS } from "../payment/payment.interface";

const bookingSchema = new Schema<IBooking>(
    {
        tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        guide: { type: Schema.Types.ObjectId, ref: "User", required: true },

        date: { type: String, required: true },
        time: { type: String, required: true },
        groupSize: { type: Number, required: true },
        phone: { type: String, required: true },
        totalPrice: { type: Number, required: true },

        address: { type: String, required: true },
        paymentUrl: { type: String},
        notes: { type: String },
        payment: { type: Schema.Types.ObjectId, ref: "Payment" },
        review: { type: Schema.Types.ObjectId, ref: "Review"},
        paymentStatus: {
            type: String,
            enum: PAYMENT_STATUS,
            default: PAYMENT_STATUS.UNPAID
        },
        status: {
            type: String,
            enum: BOOKING_STATUS,
            default: BOOKING_STATUS.PENDING
        },

        statusLogs: [
            {
                status: String,
                updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
