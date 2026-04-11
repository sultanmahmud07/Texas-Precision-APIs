/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { getTransactionId } from "../../utils/getTransactionId";
import { Types } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { bookingSearchableFields } from "./booking.constant";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";



const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const session = await Booking.startSession();
    session.startTransaction()

    try {
        const user = await User.findById(userId);

        if (!payload?.phone || !payload.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please Update Your Profile to Book a Tour.")
        }

        const tour = await Tour.findById(payload.tour).select("_id fee title").session(session);

        if (!tour?.fee) {
            throw new AppError(httpStatus.BAD_REQUEST, "No Tour Found with fee!")
        }

        const feeNumber = Number(tour.fee || 0);
        if (!Number.isFinite(feeNumber) || feeNumber <= 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid tour fee");
        }

        const groupSize = payload.groupSize ?? 1;
        const amount = feeNumber * Number(groupSize);

        const booking = await Booking.create([{
            ...payload,
            user: user?._id,
            guide: payload.guide,
            tour: tour._id,
            totalPrice: amount,
            paymentStatus: PAYMENT_STATUS.UNPAID,
            status: BOOKING_STATUS.PENDING,
            statusLogs: [
                {
                    status: BOOKING_STATUS.PENDING,
                    updatedBy: userId,
                    timestamp: new Date(),
                },
            ]
        }], { session })

        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount
        }], { session })

        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("tour", "title fee")
            .populate("payment");

        const userAddress = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone
        const userName = (updatedBooking?.user as any).name

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        // eslint-disable-next-line no-console
        console.log(sslPayment);

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        throw error
    }
};

const getBookingById = async (bookingId: string, decodedUser: JwtPayload) => {
    const booking = await Booking.findById(bookingId)
        .populate("user", "name email")
        .populate("tour", "title fee")
        .populate("guide", "name email")
        .populate("payment")
        .populate("review");



    if (!booking) {
        throw new AppError(404, "Booking not found");
    }

    const userId = decodedUser.userId;
    const role = decodedUser.role;

    // Authorization rules
    if (role === "TOURIST" && booking.user._id.toString() !== userId) {
        throw new AppError(403, "You are not allowed to view this booking");
    }

    if (role === "GUIDE" && booking.guide.toString() !== userId) {
        throw new AppError(403, "You are not allowed to view this booking");
    }

    return booking;
};


const getReservedData = async (authorId: string) => {
    const bookings = await Booking.find({ guide: authorId })
        .select("date -_id")
        .lean();
    const result = bookings.map((b: any) => b.date);
    return result
};
const getAllBookings = async (decodedToken: JwtPayload, query: Record<string, string>) => {
    const role = (decodedToken.role as string) || "";
    const userId = (decodedToken.userId || decodedToken._id) as string;

    let baseQuery;


    if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
        // admin sees all bookings
        baseQuery = Booking.find().populate("tour user guide payment review");
    } else if (role === Role.GUIDE) {
        // guide sees bookings where they are the guide
        baseQuery = Booking.find({ guide: userId }).populate("tour user guide payment review");
    } else {
        // default: traveler / tourist sees only their bookings
        baseQuery = Booking.find({ user: userId }).populate("tour guide payment review");
    }

    const queryBuilder = new QueryBuilder(baseQuery, query);
    const bookingsQuery = await queryBuilder
        .search(bookingSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([bookingsQuery.build(), queryBuilder.getMeta()]);

    return { data, meta };


};

const updateBookingStatus = async (
    bookingId: string,
    status: BOOKING_STATUS,
    decodedToken: JwtPayload
) => {
    const role = decodedToken.role;
    const userId = decodedToken.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(404, "Booking not found");

    const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    // -------------------------
    // GUIDE can confirm/decline
    // -------------------------
    if (role === Role.GUIDE) {
        if (booking.guide?._id.toString() !== userId) {
            throw new AppError(403, "Not authorized");
        }
        // if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.DECLINED].includes(status)) {
        //     throw new AppError(400, "Guide can only CONFIRM or DECLINE");
        // }
    }

    // -------------------------
    // TOURIST can cancel only
    // -------------------------
    if (role === Role.TOURIST) {
        if (booking.user.toString() !== userId) {
            throw new AppError(403, "Not authorized");
        }
        if (status !== BOOKING_STATUS.CANCELLED) {
            throw new AppError(400, "Tourist can only CANCEL bookings");
        }
    }

    // -------------------------
    // ADMIN can set any status
    // -------------------------
    if (!isAdmin && role !== Role.GUIDE && role !== Role.TOURIST) {
        throw new AppError(403, "Role not allowed");
    }

    // Update status & log
    booking.status = status;
    booking.statusLogs.push({
        status,
        updatedBy: userId,
        timestamp: new Date(),
    });

    await booking.save();

    return { data: booking };
};

const cancelBooking = async (id: string, travelerId: string) => {
    const booking = await Booking.findOne({ _id: id, user: travelerId });
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.statusLogs.push({
        status: BOOKING_STATUS.CANCELLED,
        updatedBy: new Types.ObjectId(travelerId),
        timestamp: new Date(),
    });

    await booking.save();
    return { data: booking };
};
export const BookingService = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getReservedData,
    cancelBooking
};
