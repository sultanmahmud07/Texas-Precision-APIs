
import { Contact } from "../contact/contact.model";
import { User } from "../user/user.model"; // ✅ Uncommented

export const getTouristStats = async (touristId: string) => {


  return {
    data: {
      touristId
    },
  };
};

export const getGuideStats = async (guideId: string) => {


  return {
    data: {
      guideId
    },
  };
};


export const getAdminStats = async () => {
  const now = new Date();
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const totalInquiriesP = Contact.countDocuments();
  const totalUsersP = User.countDocuments(); // ✅ Added

  // 2. Inquiry Breakdown
  const productInquiriesP = Contact.countDocuments({ inquiryType: "PRODUCT" });
  const generalInquiriesP = Contact.countDocuments({ inquiryType: "GENERAL" });

  const newInquiriesLast7P = Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newInquiriesLast30P = Contact.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // ✅ User Growth Metrics
  const newUsersLast7P = User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newUsersLast30P = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });



  // 5. Recent Activity (Last 5)
  const recentInquiriesP = Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("products", "name basePrice") 
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
    lowStockProducts
  ] = await Promise.all([
    totalInquiriesP,
    totalUsersP, // ✅
    productInquiriesP,
    generalInquiriesP,
    newInquiriesLast7P,
    newInquiriesLast30P,
    newUsersLast7P, // ✅
    newUsersLast30P, // ✅
    recentInquiriesP,
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
        inquiries: null,
        products: null,
        users: null, // ✅ Added to recent activity
      },
      inquirySeries, 
    },
  };
};



export const StatsService = {
    getTouristStats,
    getAdminStats,
    getGuideStats
}
