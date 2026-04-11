import { Types } from "mongoose";
import { PAYMENT_STATUS } from "../payment/payment.interface";

export enum BOOKING_STATUS {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    DECLINED = "DECLINED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}


export interface IBooking {
    _id?: Types.ObjectId;

    tour: Types.ObjectId;
    user: Types.ObjectId;
    guide: Types.ObjectId;

    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    phone: string; 
    address: string; 
    paymentUrl?: string; 
    groupSize: number;
    totalPrice: number;
    payment?: Types.ObjectId,
    review?: Types.ObjectId,
    paymentStatus: PAYMENT_STATUS;
    status: BOOKING_STATUS;

    notes?: string;

    statusLogs: {
        status: BOOKING_STATUS;
        updatedBy: Types.ObjectId;
        timestamp: Date;
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}
