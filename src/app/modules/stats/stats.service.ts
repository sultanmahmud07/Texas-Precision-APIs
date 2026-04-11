/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { Booking } from "../booking/booking.model";
import { Review } from "../review/review.model";
import { Tour } from "../tour/tour.model";
import { Payment } from "../payment/payment.model";
import { Product } from "../product/product.model";
import { Contact } from "../contact/contact.model";
import { Category } from "../category/category.model";
import { User } from "../user/user.model"; // ✅ Uncommented

export const getTouristStats = async (touristId: string) => {
  // Basic counts
  const totalBookings = await Booking.countDocuments({ user: touristId });
  const completedCount = await Booking.countDocuments({ user: touristId, status: "COMPLETED" });
  const upcomingCount = await Booking.countDocuments({
    user: touristId,
    status: "CONFIRMED",
    date: { $gte: new Date() },
  });
  const cancelledCount = await Booking.countDocuments({ user: touristId, status: "CANCELLED" });

  // Total paid amount (joined from payments)
  const paidAgg = await Booking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(touristId) } },
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
  const totalReviews = await Review.countDocuments({ user: touristId });

  // Recent bookings (last 5) with populated tour/guide/payment
  const recentBookings = await Booking.find({ user: touristId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tour", "title fee destinationCity")
    .populate("guide", "name email picture")
    .populate("payment", "status amount transactionId createdAt");

  // Gather booking ids to fetch recent payments (if any)
  const bookingIds = recentBookings.map((b) => b._id);
  const recentPayments = bookingIds.length
    ? await Payment.find({ booking: { $in: bookingIds } })
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
};

export const getGuideStats = async (guideId: string) => {
  // Tours count
  const totalTours = await Tour.countDocuments({ author: guideId });

  // Bookings counts
  const totalBookings = await Booking.countDocuments({ guide: guideId });
  const completedBookings = await Booking.countDocuments({ guide: guideId, status: "COMPLETED" });
  const upcomingBookings = await Booking.countDocuments({
    guide: guideId,
    status: "CONFIRMED",
    date: { $gte: new Date() },
  });

  // Earnings from paid payments (aggregate)
  const earningsAgg = await Booking.aggregate([
    { $match: { guide: new mongoose.Types.ObjectId(guideId) } },
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
  const reviewStats = await Review.aggregate([
    { $match: { guide: new mongoose.Types.ObjectId(guideId) } },
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
  const recentBookings = await Booking.find({ guide: guideId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tour", "title fee destinationCity")
    .populate("user", "name email phone")
    .populate("payment", "status amount transactionId createdAt");

  // Recent payments related to guide's recent bookings
  const bookingIds = recentBookings.map((b) => b._id);
  const recentPayments = bookingIds.length
    ? await Payment.find({ booking: { $in: bookingIds } })
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
};


export const getAdminStats = async () => {
  const now = new Date();
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // 1. Basic Counts
  const totalProductsP = Product.countDocuments();
  const totalCategoriesP = Category.countDocuments();
  const totalInquiriesP = Contact.countDocuments();
  const totalUsersP = User.countDocuments(); // ✅ Added

  // 2. Inquiry Breakdown
  const productInquiriesP = Contact.countDocuments({ inquiryType: "PRODUCT" });
  const generalInquiriesP = Contact.countDocuments({ inquiryType: "GENERAL" });

  // 3. New Additions (Growth metrics)
  const newProductsLast30P = Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const newInquiriesLast7P = Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newInquiriesLast30P = Contact.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // ✅ User Growth Metrics
  const newUsersLast7P = User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newUsersLast30P = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // 4. Low Stock Alert
  const lowStockProductsP = Product.find({ "variations.stock": { $lt: 10 } })
    .select("name slug variations images")
    .limit(5)
    .lean();

  // 5. Recent Activity (Last 5)
  const recentInquiriesP = Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("products", "name basePrice") 
    .lean();

  const recentProductsP = Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("category", "name")
    .lean();

  // ✅ Recent Users
  const recentUsersP = User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role createdAt") // Select safe fields only
    .lean();

  // 6. Inquiry Time-Series
  const inquiryTimeSeriesP = Contact.aggregate([
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

  // 7. Top Products by Inquiry Count
  const topProductsByInquiriesP = Contact.aggregate([
    { $match: { inquiryType: "PRODUCT" } },
    { $unwind: "$products" }, 
    {
      $group: {
        _id: "$products",
        inquiryCount: { $sum: 1 }, 
      },
    },
    { $sort: { inquiryCount: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: "products", 
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        productId: "$_id",
        inquiryCount: 1,
        product: { 
            name: "$product.name", 
            basePrice: "$product.basePrice", 
            slug: "$product.slug", 
            image: { $arrayElemAt: ["$product.images", 0] } 
        },
      },
    },
  ]);

  // Run all promises in parallel
  const [
    totalProducts,
    totalCategories,
    totalInquiries,
    totalUsers, // ✅
    productInquiries,
    generalInquiries,
    newProductsLast30,
    newInquiriesLast7,
    newInquiriesLast30,
    newUsersLast7, // ✅
    newUsersLast30, // ✅
    lowStockProducts,
    recentInquiries,
    recentProducts,
    recentUsers, // ✅
    inquiryTimeSeries,
    topProductsByInquiries,
  ] = await Promise.all([
    totalProductsP,
    totalCategoriesP,
    totalInquiriesP,
    totalUsersP, // ✅
    productInquiriesP,
    generalInquiriesP,
    newProductsLast30P,
    newInquiriesLast7P,
    newInquiriesLast30P,
    newUsersLast7P, // ✅
    newUsersLast30P, // ✅
    lowStockProductsP,
    recentInquiriesP,
    recentProductsP,
    recentUsersP, // ✅
    inquiryTimeSeriesP,
    topProductsByInquiriesP,
  ]);

  // Prepare Inquiry time-series for charting
  const days: { date: string; total: number }[] = [];
  const start = new Date(thirtyDaysAgo);
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d).toISOString().slice(0, 10),
      total: 0,
    });
  }

  // Map results
  const inquiryMap = new Map<string, number>();
  (inquiryTimeSeries || []).forEach((r: any) => {
    const key = new Date(r.date).toISOString().slice(0, 10);
    inquiryMap.set(key, r.total || 0);
  });
  
  const inquirySeries = days.map((day) => ({ 
    date: day.date, 
    total: inquiryMap.get(day.date) || 0 
  }));

  return {
    data: {
      summary: {
        totalProducts,
        totalCategories,
        totalInquiries,
        totalUsers, // ✅ Added to summary
      },
      counts: {
        inquiries: {
          product: productInquiries,
          general: generalInquiries,
        },
        newProductsLast30,
        newInquiriesLast7,
        newInquiriesLast30,
        newUsersLast7, // ✅ Added to counts
        newUsersLast30, // ✅ Added to counts
      },
      alerts: {
        lowStockProducts, 
      },
      recent: {
        inquiries: recentInquiries,
        products: recentProducts,
        users: recentUsers, // ✅ Added to recent activity
      },
      inquirySeries, 
      topProductsByInquiries, 
    },
  };
};



export const StatsService = {
    getTouristStats,
    getAdminStats,
    getGuideStats
}
