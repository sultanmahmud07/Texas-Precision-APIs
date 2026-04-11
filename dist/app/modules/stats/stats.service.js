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
exports.StatsService = exports.getAdminStats = exports.getGuideStats = exports.getTouristStats = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = require("../booking/booking.model");
const user_model_1 = require("../user/user.model");
const review_model_1 = require("../review/review.model");
const tour_model_1 = require("../tour/tour.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const getTouristStats = (touristId) => __awaiter(void 0, void 0, void 0, function* () {
    // Basic counts
    const totalBookings = yield booking_model_1.Booking.countDocuments({ user: touristId });
    const completedCount = yield booking_model_1.Booking.countDocuments({ user: touristId, status: "COMPLETED" });
    const upcomingCount = yield booking_model_1.Booking.countDocuments({
        user: touristId,
        status: "CONFIRMED",
        date: { $gte: new Date() },
    });
    const cancelledCount = yield booking_model_1.Booking.countDocuments({ user: touristId, status: "CANCELLED" });
    // Total paid amount (joined from payments)
    const paidAgg = yield booking_model_1.Booking.aggregate([
        { $match: { user: new mongoose_1.default.Types.ObjectId(touristId) } },
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "paymentData",
            },
        },
        { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
        { $match: { "paymentData.status": "PAID" } },
        { $group: { _id: null, totalPaid: { $sum: "$paymentData.amount" } } },
    ]);
    const totalPaid = (paidAgg[0] && paidAgg[0].totalPaid) || 0;
    // Total reviews by tourist
    const totalReviews = yield review_model_1.Review.countDocuments({ user: touristId });
    // Recent bookings (last 5) with populated tour/guide/payment
    const recentBookings = yield booking_model_1.Booking.find({ user: touristId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title fee destinationCity")
        .populate("guide", "name email picture")
        .populate("payment", "status amount transactionId createdAt");
    // Gather booking ids to fetch recent payments (if any)
    const bookingIds = recentBookings.map((b) => b._id);
    const recentPayments = bookingIds.length
        ? yield payment_model_1.Payment.find({ booking: { $in: bookingIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: "booking",
            select: "tour user guide date time totalPrice",
            populate: [
                { path: "tour", select: "title fee" },
                { path: "guide", select: "name" },
                { path: "user", select: "name email" },
            ],
        })
        : [];
    return {
        data: {
            touristId,
            totalBookings,
            completedCount,
            upcomingCount,
            cancelledCount,
            totalPaid,
            totalReviews,
            recentBookings, // array of Booking documents (populated)
            recentPayments, // array of Payment documents (populated)
        },
    };
});
exports.getTouristStats = getTouristStats;
const getGuideStats = (guideId) => __awaiter(void 0, void 0, void 0, function* () {
    // Tours count
    const totalTours = yield tour_model_1.Tour.countDocuments({ author: guideId });
    // Bookings counts
    const totalBookings = yield booking_model_1.Booking.countDocuments({ guide: guideId });
    const completedBookings = yield booking_model_1.Booking.countDocuments({ guide: guideId, status: "COMPLETED" });
    const upcomingBookings = yield booking_model_1.Booking.countDocuments({
        guide: guideId,
        status: "CONFIRMED",
        date: { $gte: new Date() },
    });
    // Earnings from paid payments (aggregate)
    const earningsAgg = yield booking_model_1.Booking.aggregate([
        { $match: { guide: new mongoose_1.default.Types.ObjectId(guideId) } },
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "paymentData",
            },
        },
        { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
        { $match: { "paymentData.status": "PAID" } },
        { $group: { _id: null, earnings: { $sum: "$paymentData.amount" } } },
    ]);
    const earnings = (earningsAgg[0] && earningsAgg[0].earnings) || 0;
    // Reviews stats for guide
    const reviewStats = yield review_model_1.Review.aggregate([
        { $match: { guide: new mongoose_1.default.Types.ObjectId(guideId) } },
        {
            $group: {
                _id: null,
                reviewCount: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);
    const reviewCount = reviewStats.length ? reviewStats[0].reviewCount : 0;
    const avgRating = reviewStats.length ? Number(reviewStats[0].avgRating.toFixed(2)) : 0;
    // Recent bookings (last 5) for guide
    const recentBookings = yield booking_model_1.Booking.find({ guide: guideId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title fee destinationCity")
        .populate("user", "name email phone")
        .populate("payment", "status amount transactionId createdAt");
    // Recent payments related to guide's recent bookings
    const bookingIds = recentBookings.map((b) => b._id);
    const recentPayments = bookingIds.length
        ? yield payment_model_1.Payment.find({ booking: { $in: bookingIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: "booking",
            select: "tour user date time totalPrice",
            populate: [
                { path: "tour", select: "title fee" },
                { path: "user", select: "name email" },
            ],
        })
        : [];
    return {
        data: {
            guideId,
            totalTours,
            totalBookings,
            completedBookings,
            upcomingBookings,
            earnings,
            reviewCount,
            avgRating,
            recentBookings,
            recentPayments,
        },
    };
});
exports.getGuideStats = getGuideStats;
const getAdminStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);
    // Basic counts (run in parallel)
    const totalUsersP = user_model_1.User.countDocuments();
    const totalToursP = tour_model_1.Tour.countDocuments();
    const totalBookingsP = booking_model_1.Booking.countDocuments();
    const totalPaymentsP = payment_model_1.Payment.countDocuments();
    const totalReviewsP = review_model_1.Review.countDocuments();
    const bookingsConfirmedP = booking_model_1.Booking.countDocuments({ status: "CONFIRMED" });
    const bookingsPendingP = booking_model_1.Booking.countDocuments({ status: "PENDING" });
    const bookingsCompletedP = booking_model_1.Booking.countDocuments({ status: "COMPLETED" });
    const bookingsCancelledP = booking_model_1.Booking.countDocuments({ status: "CANCELLED" });
    const newUsersLast7P = user_model_1.User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersLast30P = user_model_1.User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newToursLast30P = tour_model_1.Tour.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    // Recent items (last 5)
    const recentBookingsP = booking_model_1.Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title fee")
        .populate("user", "name email")
        .populate("guide", "name email")
        .populate("payment", "status amount transactionId")
        .lean();
    const recentPaymentsP = payment_model_1.Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
        path: "booking",
        select: "tour user guide date time totalPrice status",
        populate: [
            { path: "tour", select: "title fee" },
            { path: "user", select: "name email" },
            { path: "guide", select: "name email" },
        ],
    })
        .lean();
    // Total revenue (sum of PAID payments)
    const revenueAggP = payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    // Revenue time-series for last 30 days (daily)
    const revenueTimeSeriesP = payment_model_1.Payment.aggregate([
        { $match: { status: payment_interface_1.PAYMENT_STATUS.PAID, createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                },
                total: { $sum: "$amount" },
            },
        },
        {
            $project: {
                _id: 0,
                date: {
                    $dateFromParts: {
                        year: "$_id.year",
                        month: "$_id.month",
                        day: "$_id.day",
                    },
                },
                total: 1,
            },
        },
        { $sort: { date: 1 } },
    ]);
    // Bookings per status (group)
    const bookingsByStatusP = booking_model_1.Booking.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    // Top guides by earnings (sum of PAID payments for bookings where booking.guide == guide)
    const topGuidesByEarningsP = booking_model_1.Booking.aggregate([
        // join payments
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "paymentData",
            },
        },
        { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
        { $match: { "paymentData.status": payment_interface_1.PAYMENT_STATUS.PAID } },
        {
            $group: {
                _id: "$guide",
                earnings: { $sum: "$paymentData.amount" },
                bookingsCount: { $sum: 1 },
            },
        },
        { $sort: { earnings: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "guide",
            },
        },
        { $unwind: { path: "$guide", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                guideId: "$_id",
                earnings: 1,
                bookingsCount: 1,
                guide: { name: "$guide.name", email: "$guide.email", _id: "$guide._id", picture: "$guide.picture" },
            },
        },
    ]);
    // Top tours by bookings count
    const topToursByBookingsP = booking_model_1.Booking.aggregate([
        {
            $group: {
                _id: "$tour",
                bookingsCount: { $sum: 1 },
            },
        },
        { $sort: { bookingsCount: -1 } },
        { $limit: 6 },
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour",
            },
        },
        { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                tourId: "$_id",
                bookingsCount: 1,
                tour: { title: "$tour.title", fee: "$tour.fee", destinationCity: "$tour.destinationCity", _id: "$tour._id", thumbnail: "$tour.thumbnail" },
            },
        },
    ]);
    // Run all promises in parallel
    const [totalUsers, totalTours, totalBookings, totalPayments, totalReviews, bookingsConfirmed, bookingsPending, bookingsCompleted, bookingsCancelled, newUsersLast7, newUsersLast30, newToursLast30, recentBookings, recentPayments, revenueAgg, revenueTimeSeries, bookingsByStatus, topGuidesByEarnings, topToursByBookings,] = yield Promise.all([
        totalUsersP,
        totalToursP,
        totalBookingsP,
        totalPaymentsP,
        totalReviewsP,
        bookingsConfirmedP,
        bookingsPendingP,
        bookingsCompletedP,
        bookingsCancelledP,
        newUsersLast7P,
        newUsersLast30P,
        newToursLast30P,
        recentBookingsP,
        recentPaymentsP,
        revenueAggP,
        revenueTimeSeriesP,
        bookingsByStatusP,
        topGuidesByEarningsP,
        topToursByBookingsP,
    ]);
    const totalRevenue = (revenueAgg && revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;
    // Normalize bookingsByStatus to key:value map
    const bookingsByStatusMap = {};
    bookingsByStatus.forEach((b) => {
        bookingsByStatusMap[String(b._id || "UNKNOWN")] = b.count || 0;
    });
    // Prepare revenue time-series for charting (fill missing days)
    const days = [];
    const start = new Date(thirtyDaysAgo);
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        days.push({
            date: new Date(d).toISOString().slice(0, 10),
            total: 0,
        });
    }
    // map results
    const revenueMap = new Map();
    (revenueTimeSeries || []).forEach((r) => {
        const key = new Date(r.date).toISOString().slice(0, 10);
        revenueMap.set(key, r.total || 0);
    });
    const revenueSeries = days.map((day) => ({ date: day.date, total: revenueMap.get(day.date) || 0 }));
    return {
        data: {
            summary: {
                totalUsers,
                totalTours,
                totalBookings,
                totalPayments,
                totalReviews,
                totalRevenue,
            },
            counts: {
                bookings: {
                    confirmed: bookingsConfirmed,
                    pending: bookingsPending,
                    completed: bookingsCompleted,
                    cancelled: bookingsCancelled,
                },
                newUsersLast7,
                newUsersLast30,
                newToursLast30,
            },
            recent: {
                bookings: recentBookings,
                payments: recentPayments,
            },
            bookingsByStatus: bookingsByStatusMap,
            revenueSeries, // [{date: '2025-12-01', total: 123}, ...] (last 30 days)
            topGuidesByEarnings,
            topToursByBookings,
        },
    };
});
exports.getAdminStats = getAdminStats;
exports.StatsService = {
    getTouristStats: exports.getTouristStats,
    getAdminStats: exports.getAdminStats,
    getGuideStats: exports.getGuideStats
};
