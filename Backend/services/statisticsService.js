import mongoose from "mongoose";
import Truck from "../models/Truck.js";
import Trailer from "../models/Trailer.js";
import Trip from "../models/Trip.js";
import Fuel from "../models/Fuel.js";
import User from "../models/User.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import { VEHICLE_STATUS, TRIP_STATUS, USER_ROLES } from "../utils/constants.js";

// Get fleet overview statistics

export const getFleetOverview = async () => {
  const [trucks, trailers, trucksByStatus, trailersByStatus] =
    await Promise.all([
      Truck.countDocuments(),
      Trailer.countDocuments(),
      Truck.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Trailer.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

  // Calculate total mileage and average age
  const truckStats = await Truck.aggregate([
    {
      $group: {
        _id: null,
        totalMileage: { $sum: "$mileage" },
        avgMileage: { $avg: "$mileage" },
        avgYear: { $avg: "$year" },
        totalLoadCapacity: { $sum: "$loadCapacity" },
      },
    },
  ]);

  const currentYear = new Date().getFullYear();
  const avgAge = truckStats[0]
    ? currentYear - Math.round(truckStats[0].avgYear)
    : 0;

  // Format status counts
  const statusCounts = {};
  Object.values(VEHICLE_STATUS).forEach((status) => {
    const truckCount = trucksByStatus.find((s) => s._id === status)?.count || 0;
    const trailerCount =
      trailersByStatus.find((s) => s._id === status)?.count || 0;
    statusCounts[status] = {
      trucks: truckCount,
      trailers: trailerCount,
      total: truckCount + trailerCount,
    };
  });

  return {
    totalVehicles: trucks + trailers,
    trucks: {
      total: trucks,
      totalMileage: truckStats[0]?.totalMileage || 0,
      avgMileage: Math.round(truckStats[0]?.avgMileage || 0),
      avgAge,
      totalLoadCapacity: truckStats[0]?.totalLoadCapacity || 0,
    },
    trailers: {
      total: trailers,
    },
    byStatus: statusCounts,
  };
};

// Get trip statistics with optional date range

export const getTripStatistics = async (startDate, endDate) => {
  const dateMatch = {};
  if (startDate) dateMatch.$gte = new Date(startDate);
  if (endDate) dateMatch.$lte = new Date(endDate);

  const dateFilter =
    Object.keys(dateMatch).length > 0 ? { departureDate: dateMatch } : {};

  const [tripsByStatus, tripStats, tripsByMonth, topDrivers, topRoutes] =
    await Promise.all([
      // Trips by status
      Trip.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Overall trip stats
      Trip.aggregate([
        { $match: { ...dateFilter, status: TRIP_STATUS.COMPLETED } },
        {
          $group: {
            _id: null,
            totalTrips: { $sum: 1 },
            totalDistance: { $sum: { $subtract: ["$endKm", "$startKm"] } },
            avgDistance: { $avg: { $subtract: ["$endKm", "$startKm"] } },
            totalFuelConsumed: { $sum: "$fuelConsumed" },
            totalFuelCost: { $sum: "$fuelCost" },
          },
        },
      ]),

      // Trips by month
      Trip.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$departureDate" },
              month: { $month: "$departureDate" },
            },
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", TRIP_STATUS.COMPLETED] }, 1, 0],
              },
            },
            distance: {
              $sum: {
                $cond: [
                  { $eq: ["$status", TRIP_STATUS.COMPLETED] },
                  { $subtract: ["$endKm", "$startKm"] },
                  0,
                ],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),

      // Top drivers by completed trips
      Trip.aggregate([
        { $match: { ...dateFilter, status: TRIP_STATUS.COMPLETED } },
        {
          $group: {
            _id: "$driver",
            tripCount: { $sum: 1 },
            totalDistance: { $sum: { $subtract: ["$endKm", "$startKm"] } },
          },
        },
        { $sort: { tripCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "driverInfo",
          },
        },
        { $unwind: "$driverInfo" },
        {
          $project: {
            driverId: "$_id",
            driverName: {
              $concat: ["$driverInfo.firstName", " ", "$driverInfo.lastName"],
            },
            tripCount: 1,
            totalDistance: 1,
          },
        },
      ]),

      // Top routes
      Trip.aggregate([
        { $match: { ...dateFilter, status: TRIP_STATUS.COMPLETED } },
        {
          $group: {
            _id: {
              origin: "$origin.city",
              destination: "$destination.city",
            },
            count: { $sum: 1 },
            avgDistance: { $avg: { $subtract: ["$endKm", "$startKm"] } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

  // Format status counts
  const statusCounts = {};
  Object.values(TRIP_STATUS).forEach((status) => {
    statusCounts[status] =
      tripsByStatus.find((s) => s._id === status)?.count || 0;
  });

  return {
    summary: {
      totalTrips: tripStats[0]?.totalTrips || 0,
      totalDistance: Math.round(tripStats[0]?.totalDistance || 0),
      avgDistance: Math.round(tripStats[0]?.avgDistance || 0),
      totalFuelConsumed: Math.round(tripStats[0]?.totalFuelConsumed || 0),
      totalFuelCost: Math.round(tripStats[0]?.totalFuelCost || 0),
    },
    byStatus: statusCounts,
    byMonth: tripsByMonth.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
      completed: m.completed,
      distance: Math.round(m.distance),
    })),
    topDrivers,
    topRoutes: topRoutes.map((r) => ({
      origin: r._id.origin,
      destination: r._id.destination,
      count: r.count,
      avgDistance: Math.round(r.avgDistance || 0),
    })),
  };
};

// Get fuel consumption statistics

export const getFuelStatistics = async (startDate, endDate) => {
  const dateMatch = {};
  if (startDate) dateMatch.$gte = new Date(startDate);
  if (endDate) dateMatch.$lte = new Date(endDate);

  const dateFilter =
    Object.keys(dateMatch).length > 0 ? { date: dateMatch } : {};

  const [fuelStats, fuelByMonth, fuelByVehicle, fuelByType] = await Promise.all(
    [
      // Overall fuel stats
      Fuel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: "$volume" },
            totalCost: { $sum: "$totalCost" },
            avgUnitCost: { $avg: "$unitCost" },
            recordCount: { $sum: 1 },
          },
        },
      ]),

      // Fuel by month
      Fuel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            volume: { $sum: "$volume" },
            cost: { $sum: "$totalCost" },
            avgUnitCost: { $avg: "$unitCost" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),

      // Fuel consumption by vehicle (top 10)
      Fuel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$vehicle",
            totalVolume: { $sum: "$volume" },
            totalCost: { $sum: "$totalCost" },
            recordCount: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "trucks",
            localField: "_id",
            foreignField: "_id",
            as: "truckInfo",
          },
        },
        { $unwind: { path: "$truckInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            vehicleId: "$_id",
            plateNumber: "$truckInfo.plateNumber",
            brand: "$truckInfo.brand",
            model: "$truckInfo.model",
            totalVolume: 1,
            totalCost: 1,
            recordCount: 1,
          },
        },
      ]),

      // Fuel by type
      Fuel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$fuelType",
            totalVolume: { $sum: "$volume" },
            totalCost: { $sum: "$totalCost" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
      ]),
    ]
  );

  return {
    summary: {
      totalVolume: Math.round(fuelStats[0]?.totalVolume || 0),
      totalCost: Math.round(fuelStats[0]?.totalCost || 0),
      avgUnitCost: Math.round((fuelStats[0]?.avgUnitCost || 0) * 100) / 100,
      recordCount: fuelStats[0]?.recordCount || 0,
    },
    byMonth: fuelByMonth.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      volume: Math.round(m.volume),
      cost: Math.round(m.cost),
      avgUnitCost: Math.round(m.avgUnitCost * 100) / 100,
    })),
    byVehicle: fuelByVehicle,
    byType: fuelByType,
  };
};

// Get maintenance statistics

export const getMaintenanceStatistics = async (startDate, endDate) => {
  const dateMatch = {};
  if (startDate) dateMatch.$gte = new Date(startDate);
  if (endDate) dateMatch.$lte = new Date(endDate);

  const dateFilter =
    Object.keys(dateMatch).length > 0 ? { date: dateMatch } : {};

  const [maintenanceStats, byType, byMonth, byVehicle] = await Promise.all([
    // Overall maintenance stats
    MaintenanceLog.aggregate([
      { $match: { ...dateFilter, status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$cost" },
          avgCost: { $avg: "$cost" },
          totalDuration: { $sum: "$duration" },
          count: { $sum: 1 },
        },
      },
    ]),

    // By maintenance type
    MaintenanceLog.aggregate([
      { $match: { ...dateFilter, status: "COMPLETED" } },
      {
        $group: {
          _id: "$operationType",
          count: { $sum: 1 },
          totalCost: { $sum: "$cost" },
          avgCost: { $avg: "$cost" },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // By month
    MaintenanceLog.aggregate([
      { $match: { ...dateFilter, status: "COMPLETED" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
          cost: { $sum: "$cost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),

    // By vehicle (top maintenance costs)
    MaintenanceLog.aggregate([
      { $match: { ...dateFilter, status: "COMPLETED" } },
      {
        $group: {
          _id: { vehicle: "$vehicle", vehicleType: "$vehicleType" },
          count: { $sum: 1 },
          totalCost: { $sum: "$cost" },
        },
      },
      { $sort: { totalCost: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    summary: {
      totalCost: Math.round(maintenanceStats[0]?.totalCost || 0),
      avgCost: Math.round(maintenanceStats[0]?.avgCost || 0),
      totalDuration: Math.round(maintenanceStats[0]?.totalDuration || 0),
      totalRecords: maintenanceStats[0]?.count || 0,
    },
    byType,
    byMonth: byMonth.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
      cost: Math.round(m.cost),
    })),
    byVehicle,
  };
};

// Get driver performance statistics

export const getDriverStatistics = async (startDate, endDate) => {
  const dateMatch = {};
  if (startDate) dateMatch.$gte = new Date(startDate);
  if (endDate) dateMatch.$lte = new Date(endDate);

  const tripDateFilter =
    Object.keys(dateMatch).length > 0 ? { departureDate: dateMatch } : {};

  const [driverCount, driverPerformance] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.DRIVER, active: true }),

    Trip.aggregate([
      { $match: { ...tripDateFilter, status: TRIP_STATUS.COMPLETED } },
      {
        $group: {
          _id: "$driver",
          tripCount: { $sum: 1 },
          totalDistance: { $sum: { $subtract: ["$endKm", "$startKm"] } },
          totalFuelCost: { $sum: "$fuelCost" },
          uniqueDays: {
            $addToSet: {
              $dateToString: { format: "%Y-%m-%d", date: "$departureDate" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driverInfo",
        },
      },
      { $unwind: "$driverInfo" },
      {
        $project: {
          driverId: "$_id",
          firstName: "$driverInfo.firstName",
          lastName: "$driverInfo.lastName",
          email: "$driverInfo.email",
          tripCount: 1,
          totalDistance: 1,
          totalFuelCost: 1,
          activeDays: { $size: "$uniqueDays" },
          avgDistancePerTrip: { $divide: ["$totalDistance", "$tripCount"] },
        },
      },
      { $sort: { tripCount: -1 } },
    ]),
  ]);

  return {
    totalDrivers: driverCount,
    performance: driverPerformance.map((d) => ({
      ...d,
      totalDistance: Math.round(d.totalDistance || 0),
      totalFuelCost: Math.round(d.totalFuelCost || 0),
      avgDistancePerTrip: Math.round(d.avgDistancePerTrip || 0),
    })),
  };
};

// Get financial summary

export const getFinancialSummary = async (startDate, endDate) => {
  const [fuelStats, maintenanceStats, tripStats] = await Promise.all([
    getFuelStatistics(startDate, endDate),
    getMaintenanceStatistics(startDate, endDate),
    getTripStatistics(startDate, endDate),
  ]);

  const totalOperatingCost =
    fuelStats.summary.totalCost + maintenanceStats.summary.totalCost;
  const totalDistance = tripStats.summary.totalDistance;
  const costPerKm = totalDistance > 0 ? totalOperatingCost / totalDistance : 0;

  return {
    fuelCost: fuelStats.summary.totalCost,
    maintenanceCost: maintenanceStats.summary.totalCost,
    totalOperatingCost,
    totalDistance,
    costPerKm: Math.round(costPerKm * 100) / 100,
    totalTrips: tripStats.summary.totalTrips,
    avgCostPerTrip:
      tripStats.summary.totalTrips > 0
        ? Math.round(totalOperatingCost / tripStats.summary.totalTrips)
        : 0,
  };
};

// Get dashboard summary

export const getDashboardSummary = async () => {
  const [fleet, trips, fuel, maintenance, drivers] = await Promise.all([
    getFleetOverview(),
    getTripStatistics(),
    getFuelStatistics(),
    getMaintenanceStatistics(),
    getDriverStatistics(),
  ]);

  return {
    fleet: {
      totalVehicles: fleet.totalVehicles,
      trucksAvailable: fleet.byStatus[VEHICLE_STATUS.AVAILABLE]?.trucks || 0,
      trucksOnTrip: fleet.byStatus[VEHICLE_STATUS.ON_TRIP]?.trucks || 0,
      trucksInMaintenance:
        fleet.byStatus[VEHICLE_STATUS.UNDER_MAINTENANCE]?.trucks || 0,
    },
    trips: {
      completed: trips.byStatus[TRIP_STATUS.COMPLETED] || 0,
      inProgress: trips.byStatus[TRIP_STATUS.IN_PROGRESS] || 0,
      planned: trips.byStatus[TRIP_STATUS.PLANNED] || 0,
      totalDistance: trips.summary.totalDistance,
    },
    fuel: {
      totalCost: fuel.summary.totalCost,
      totalVolume: fuel.summary.totalVolume,
    },
    maintenance: {
      totalCost: maintenance.summary.totalCost,
      totalRecords: maintenance.summary.totalRecords,
    },
    drivers: {
      total: drivers.totalDrivers,
      topPerformer: drivers.performance[0] || null,
    },
  };
};

export default {
  getFleetOverview,
  getTripStatistics,
  getFuelStatistics,
  getMaintenanceStatistics,
  getDriverStatistics,
  getFinancialSummary,
  getDashboardSummary,
};
