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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const address_model_1 = require("../address/address.model");
const availability_model_1 = require("../availability/availability.model");
const inspection_model_1 = require("../inspection/inspection.model");
const user_model_1 = require("../user/user.model");
const getAdminStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    // 1. Total Counts
    const totalUsersP = user_model_1.User.countDocuments();
    const totalInspectionsP = inspection_model_1.Inspection.countDocuments();
    const totalAddressesP = address_model_1.Address.countDocuments();
    const totalAvailabilityP = availability_model_1.Availability.countDocuments(); // Total days scheduled
    // 2. Inspection Breakdown by Status
    const pendingInspectionsP = inspection_model_1.Inspection.countDocuments({ status: "Pending" });
    const confirmedInspectionsP = inspection_model_1.Inspection.countDocuments({ status: "Confirmed" });
    const completedInspectionsP = inspection_model_1.Inspection.countDocuments({ status: "Completed" });
    const cancelledInspectionsP = inspection_model_1.Inspection.countDocuments({ status: "Cancelled" });
    // 3. Growth Metrics (Last 30 Days)
    const newUsersLast30P = user_model_1.User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newInspectionsLast30P = inspection_model_1.Inspection.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newAddressesLast30P = address_model_1.Address.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    // 4. Recent Activity (Last 5)
    const recentInspectionsP = inspection_model_1.Inspection.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    const recentUsersP = user_model_1.User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt")
        .lean();
    // 5. Inspection Time-Series (Bookings over the last 30 days)
    const inspectionTimeSeriesP = inspection_model_1.Inspection.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                },
                total: { $sum: 1 },
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
    // Run all promises in parallel for maximum speed
    const [totalUsers, totalInspections, totalAddresses, totalAvailability, pendingInspections, confirmedInspections, completedInspections, cancelledInspections, newUsersLast30, newInspectionsLast30, newAddressesLast30, recentInspections, recentUsers, inspectionTimeSeries] = yield Promise.all([
        totalUsersP, totalInspectionsP, totalAddressesP, totalAvailabilityP,
        pendingInspectionsP, confirmedInspectionsP, completedInspectionsP, cancelledInspectionsP,
        newUsersLast30P, newInspectionsLast30P, newAddressesLast30P,
        recentInspectionsP, recentUsersP,
        inspectionTimeSeriesP
    ]);
    // Prepare Time-series data format for the frontend chart
    const days = [];
    const start = new Date(thirtyDaysAgo);
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        days.push({
            date: new Date(d).toISOString().slice(0, 10),
            total: 0,
        });
    }
    const inspectionMap = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inspectionTimeSeries.forEach((item) => {
        inspectionMap.set(item.date.toISOString().slice(0, 10), item.total);
    });
    const inspectionSeries = days.map((day) => ({
        date: day.date,
        total: inspectionMap.get(day.date) || 0
    }));
    return {
        data: {
            summary: {
                totalUsers,
                totalInspections,
                totalAddresses, // Acting as collected Leads
                totalAvailability, // Total days plotted on calendar
            },
            counts: {
                newUsersLast30,
                newInspectionsLast30,
                newAddressesLast30,
                inspectionStatus: {
                    pending: pendingInspections,
                    confirmed: confirmedInspections,
                    completed: completedInspections,
                    cancelled: cancelledInspections
                }
            },
            recent: {
                inspections: recentInspections,
                users: recentUsers,
            },
            inspectionSeries,
        },
    };
});
exports.StatsService = {
    getAdminStats
};
