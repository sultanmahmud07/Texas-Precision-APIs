"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const tour_model_1 = require("../tour/tour.model");
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const getTransactionId_1 = require("../../utils/getTransactionId");
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const booking_constant_1 = require("./booking.constant");
const user_interface_1 = require("../user/user.interface");
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(payload === null || payload === void 0 ? void 0 : payload.phone) || !payload.address) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please Update Your Profile to Book a Tour.");
        }
        const tour = yield tour_model_1.Tour.findById(payload.tour).select("_id fee title").session(session);
        if (!(tour === null || tour === void 0 ? void 0 : tour.fee)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No Tour Found with fee!");
        }
        const feeNumber = Number(tour.fee || 0);
        if (!Number.isFinite(feeNumber) || feeNumber <= 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid tour fee");
        }
        const groupSize = (_a = payload.groupSize) !== null && _a !== void 0 ? _a : 1;
        const amount = feeNumber * Number(groupSize);
        const booking = yield booking_model_1.Booking.create([Object.assign(Object.assign({}, payload), { user: user === null || user === void 0 ? void 0 : user._id, guide: payload.guide, tour: tour._id, totalPrice: amount, paymentStatus: payment_interface_1.PAYMENT_STATUS.UNPAID, status: booking_interface_1.BOOKING_STATUS.PENDING, statusLogs: [
                    {
                        status: booking_interface_1.BOOKING_STATUS.PENDING,
                        updatedBy: userId,
                        timestamp: new Date(),
                    },
                ] })], { session });
        const payment = yield payment_model_1.Payment.create([{
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount
            }], { session });
        const updatedBooking = yield booking_model_1.Booking
            .findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("user", "name email phone address")
            .populate("tour", "title fee")
            .populate("payment");
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        // eslint-disable-next-line no-console
        console.log(sslPayment);
        yield session.commitTransaction(); //transaction
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        };
    }
    catch (error) {
        yield session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
});
const getBookingById = (bookingId, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findById(bookingId)
        .populate("user", "name email")
        .populate("tour", "title fee")
        .populate("guide", "name email")
        .populate("payment")
        .populate("review");
    if (!booking) {
        throw new AppError_1.default(404, "Booking not found");
    }
    const userId = decodedUser.userId;
    const role = decodedUser.role;
    // Authorization rules
    if (role === "TOURIST" && booking.user._id.toString() !== userId) {
        throw new AppError_1.default(403, "You are not allowed to view this booking");
    }
    if (role === "GUIDE" && booking.guide.toString() !== userId) {
        throw new AppError_1.default(403, "You are not allowed to view this booking");
    }
    return booking;
});
const getReservedData = (authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield booking_model_1.Booking.find({ guide: authorId })
        .select("date -_id")
        .lean();
    const result = bookings.map((b) => b.date);
    return result;
});
const getAllBookings = (decodedToken, query) => __awaiter(void 0, void 0, void 0, function* () {
    const role = decodedToken.role || "";
    const userId = (decodedToken.userId || decodedToken._id);
    let baseQuery;
    if (role === user_interface_1.Role.ADMIN || role === user_interface_1.Role.SUPER_ADMIN) {
        // admin sees all bookings
        baseQuery = booking_model_1.Booking.find().populate("tour user guide payment review");
    }
    else if (role === user_interface_1.Role.GUIDE) {
        // guide sees bookings where they are the guide
        baseQuery = booking_model_1.Booking.find({ guide: userId }).populate("tour user guide payment review");
    }
    else {
        // default: traveler / tourist sees only their bookings
        baseQuery = booking_model_1.Booking.find({ user: userId }).populate("tour guide payment review");
    }
    const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
    const bookingsQuery = yield queryBuilder
        .search(booking_constant_1.bookingSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([bookingsQuery.build(), queryBuilder.getMeta()]);
    return { data, meta };
});
const updateBookingStatus = (bookingId, status, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const role = decodedToken.role;
    const userId = decodedToken.userId;
    const booking = yield booking_model_1.Booking.findById(bookingId);
    if (!booking)
        throw new AppError_1.default(404, "Booking not found");
    const isAdmin = role === user_interface_1.Role.ADMIN || role === user_interface_1.Role.SUPER_ADMIN;
    // -------------------------
    // GUIDE can confirm/decline
    // -------------------------
    if (role === user_interface_1.Role.GUIDE) {
        if (((_a = booking.guide) === null || _a === void 0 ? void 0 : _a._id.toString()) !== userId) {
            throw new AppError_1.default(403, "Not authorized");
        }
        // if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.DECLINED].includes(status)) {
        //     throw new AppError(400, "Guide can only CONFIRM or DECLINE");
        // }
    }
    // -------------------------
    // TOURIST can cancel only
    // -------------------------
    if (role === user_interface_1.Role.TOURIST) {
        if (booking.user.toString() !== userId) {
            throw new AppError_1.default(403, "Not authorized");
        }
        if (status !== booking_interface_1.BOOKING_STATUS.CANCELLED) {
            throw new AppError_1.default(400, "Tourist can only CANCEL bookings");
        }
    }
    // -------------------------
    // ADMIN can set any status
    // -------------------------
    if (!isAdmin && role !== user_interface_1.Role.GUIDE && role !== user_interface_1.Role.TOURIST) {
        throw new AppError_1.default(403, "Role not allowed");
    }
    // Update status & log
    booking.status = status;
    booking.statusLogs.push({
        status,
        updatedBy: userId,
        timestamp: new Date(),
    });
    yield booking.save();
    return { data: booking };
});
const cancelBooking = (id, travelerId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findOne({ _id: id, user: travelerId });
    if (!booking)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    booking.status = booking_interface_1.BOOKING_STATUS.CANCELLED;
    booking.statusLogs.push({
        status: booking_interface_1.BOOKING_STATUS.CANCELLED,
        updatedBy: new mongoose_1.Types.ObjectId(travelerId),
        timestamp: new Date(),
    });
    yield booking.save();
    return { data: booking };
});
exports.BookingService = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getReservedData,
    cancelBooking
};
