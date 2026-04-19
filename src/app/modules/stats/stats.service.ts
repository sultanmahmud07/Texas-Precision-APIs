import { Address } from "../address/address.model";
import { Availability } from "../availability/availability.model";
import { Inspection } from "../inspection/inspection.model";
import { User } from "../user/user.model"; 
const getAdminStats = async () => {
  const now = new Date();
  
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // 1. Total Counts
  const totalUsersP = User.countDocuments();
  const totalInspectionsP = Inspection.countDocuments();
  const totalAddressesP = Address.countDocuments();
  const totalAvailabilityP = Availability.countDocuments(); // Total days scheduled

  // 2. Inspection Breakdown by Status
  const pendingInspectionsP = Inspection.countDocuments({ status: "Pending" });
  const confirmedInspectionsP = Inspection.countDocuments({ status: "Confirmed" });
  const completedInspectionsP = Inspection.countDocuments({ status: "Completed" });
  const cancelledInspectionsP = Inspection.countDocuments({ status: "Cancelled" });

  // 3. Growth Metrics (Last 30 Days)
  const newUsersLast30P = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const newInspectionsLast30P = Inspection.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const newAddressesLast30P = Address.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // 4. Recent Activity (Last 5)
  const recentInspectionsP = Inspection.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentUsersP = User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role createdAt") 
    .lean();

  // 5. Inspection Time-Series (Bookings over the last 30 days)
  const inspectionTimeSeriesP = Inspection.aggregate([
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
  const [
    totalUsers, totalInspections, totalAddresses, totalAvailability,
    pendingInspections, confirmedInspections, completedInspections, cancelledInspections,
    newUsersLast30, newInspectionsLast30, newAddressesLast30,
    recentInspections, recentUsers,
    inspectionTimeSeries
  ] = await Promise.all([
    totalUsersP, totalInspectionsP, totalAddressesP, totalAvailabilityP,
    pendingInspectionsP, confirmedInspectionsP, completedInspectionsP, cancelledInspectionsP,
    newUsersLast30P, newInspectionsLast30P, newAddressesLast30P,
    recentInspectionsP, recentUsersP,
    inspectionTimeSeriesP
  ]);

  // Prepare Time-series data format for the frontend chart
  const days: { date: string; total: number }[] = [];
  const start = new Date(thirtyDaysAgo);
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d).toISOString().slice(0, 10),
      total: 0,
    });
  }

  const inspectionMap = new Map<string, number>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inspectionTimeSeries.forEach((item: any) => {
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
};

export const StatsService = {
    getAdminStats
};