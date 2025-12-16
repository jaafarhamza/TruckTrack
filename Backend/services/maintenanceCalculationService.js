import Truck from "../models/Truck.js";
import Trailer from "../models/Trailer.js";
import MaintenanceRule from "../models/MaintenanceRule.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import { VEHICLE_TYPE, MAINTENANCE_TYPE } from "../utils/constants.js";

const DUE_SOON_THRESHOLD_PERCENT = 0.1;

export const checkVehicleMaintenance = async (vehicle, vehicleType) => {
  const alerts = [];
  const activeRules = await MaintenanceRule.find({ active: true });

  for (const rule of activeRules) {
    const lastLog = await MaintenanceLog.getLastMaintenance(
      vehicle._id,
      vehicleType,
      rule.type
    );

    const alert = calculateMaintenanceStatus(
      vehicle,
      vehicleType,
      rule,
      lastLog
    );

    if (alert) {
      alerts.push(alert);
    }
  }

  return alerts;
};

const calculateMaintenanceStatus = (vehicle, vehicleType, rule, lastLog) => {
  const now = new Date();
  let kmSinceLastMaintenance = vehicle.mileage;
  let monthsSinceLastMaintenance = null;
  let lastMaintenanceDate = null;
  let lastMaintenanceKm = 0;

  if (lastLog) {
    lastMaintenanceKm = lastLog.currentKm;
    kmSinceLastMaintenance = vehicle.mileage - lastLog.currentKm;
    lastMaintenanceDate = lastLog.date;

    // Calculate months since last maintenance
    const diffTime = now - new Date(lastLog.date);
    monthsSinceLastMaintenance = diffTime / (1000 * 60 * 60 * 24 * 30);
  }

  let status = "OK"; 
  let priority = "low";
  let kmRemaining = null;
  let monthsRemaining = null;
  let kmOverdue = 0;
  let monthsOverdue = 0;

  // Check km-based interval
  if (rule.kmInterval) {
    kmRemaining = rule.kmInterval - kmSinceLastMaintenance;

    if (kmRemaining <= 0) {
      status = "OVERDUE";
      priority = "high";
      kmOverdue = Math.abs(kmRemaining);
    } else if (kmRemaining <= rule.kmInterval * DUE_SOON_THRESHOLD_PERCENT) {
      status = "DUE_SOON";
      priority = "medium";
    }
  }

  // Check time-based interval
  if (rule.monthInterval && lastMaintenanceDate) {
    monthsRemaining = rule.monthInterval - monthsSinceLastMaintenance;

    if (monthsRemaining <= 0) {
      status = "OVERDUE";
      priority = "high";
      monthsOverdue = Math.abs(monthsRemaining);
    } else if (
      status !== "OVERDUE" &&
      monthsRemaining <= rule.monthInterval * DUE_SOON_THRESHOLD_PERCENT
    ) {
      if (status !== "OVERDUE") {
        status = "DUE_SOON";
        priority = priority === "high" ? "high" : "medium";
      }
    }
  }

  // For new vehicles without maintenance history
  if (!lastLog && rule.monthInterval) {
    // Check against purchase date or creation date
    const startDate = vehicle.purchaseDate || vehicle.createdAt;
    const diffTime = now - new Date(startDate);
    monthsSinceLastMaintenance = diffTime / (1000 * 60 * 60 * 24 * 30);
    monthsRemaining = rule.monthInterval - monthsSinceLastMaintenance;

    if (monthsRemaining <= 0) {
      status = "OVERDUE";
      priority = "high";
      monthsOverdue = Math.abs(monthsRemaining);
    } else if (
      monthsRemaining <=
      rule.monthInterval * DUE_SOON_THRESHOLD_PERCENT
    ) {
      status = "DUE_SOON";
      priority = "medium";
    }
  }

  // Only return alert if maintenance is due or due soon
  if (status === "OK") {
    return null;
  }

  return {
    vehicleId: vehicle._id,
    vehicleType,
    plateNumber: vehicle.plateNumber,
    vehicleInfo: `${vehicle.brand || ""} ${vehicle.model || ""} ${
      vehicle.year || ""
    }`.trim(),
    ruleId: rule._id,
    maintenanceType: rule.type,
    description: rule.description,
    status,
    priority,
    currentKm: vehicle.mileage,
    lastMaintenanceKm,
    lastMaintenanceDate,
    kmSinceLastMaintenance,
    kmRemaining: kmRemaining ? Math.max(0, kmRemaining) : null,
    kmOverdue: kmOverdue > 0 ? kmOverdue : null,
    monthsRemaining: monthsRemaining ? Math.max(0, monthsRemaining) : null,
    monthsOverdue:
      monthsOverdue > 0 ? Math.round(monthsOverdue * 10) / 10 : null,
    estimatedCost: rule.estimatedCost,
    nextMaintenanceKm: lastMaintenanceKm + (rule.kmInterval || 0),
    nextMaintenanceDate: lastMaintenanceDate
      ? new Date(
          new Date(lastMaintenanceDate).setMonth(
            new Date(lastMaintenanceDate).getMonth() + (rule.monthInterval || 0)
          )
        )
      : null,
  };
};

export const getAllMaintenanceAlerts = async (options = {}) => {
  const { vehicleType, maintenanceType, status: filterStatus } = options;

  const alerts = [];

  // Get all trucks
  const trucks = await Truck.find({});
  for (const truck of trucks) {
    if (!vehicleType || vehicleType === VEHICLE_TYPE.TRUCK) {
      const truckAlerts = await checkVehicleMaintenance(
        truck,
        VEHICLE_TYPE.TRUCK
      );
      alerts.push(...truckAlerts);
    }
  }

  // Get all trailers
  const trailers = await Trailer.find({});
  for (const trailer of trailers) {
    if (!vehicleType || vehicleType === VEHICLE_TYPE.TRAILER) {
      const trailerAlerts = await checkVehicleMaintenance(
        trailer,
        VEHICLE_TYPE.TRAILER
      );
      alerts.push(...trailerAlerts);
    }
  }

  // Apply filters
  let filteredAlerts = alerts;

  if (maintenanceType) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.maintenanceType === maintenanceType
    );
  }

  if (filterStatus) {
    filteredAlerts = filteredAlerts.filter((a) => a.status === filterStatus);
  }

  // Sort by priority and status
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = { OVERDUE: 0, DUE_SOON: 1, OK: 2 };

  filteredAlerts.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Group by priority
  const grouped = {
    high: filteredAlerts.filter((a) => a.priority === "high"),
    medium: filteredAlerts.filter((a) => a.priority === "medium"),
    low: filteredAlerts.filter((a) => a.priority === "low"),
  };

  // Summary stats
  const summary = {
    total: filteredAlerts.length,
    overdue: filteredAlerts.filter((a) => a.status === "OVERDUE").length,
    dueSoon: filteredAlerts.filter((a) => a.status === "DUE_SOON").length,
    byType: {},
    estimatedTotalCost: filteredAlerts.reduce(
      (sum, a) => sum + (a.estimatedCost || 0),
      0
    ),
  };

  // Count by maintenance type
  Object.values(MAINTENANCE_TYPE).forEach((type) => {
    summary.byType[type] = filteredAlerts.filter(
      (a) => a.maintenanceType === type
    ).length;
  });

  return {
    alerts: filteredAlerts,
    grouped,
    summary,
  };
};

export const getVehicleMaintenanceStatus = async (vehicleId, vehicleType) => {
  const Model = vehicleType === VEHICLE_TYPE.TRUCK ? Truck : Trailer;
  const vehicle = await Model.findById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const alerts = await checkVehicleMaintenance(vehicle, vehicleType);

  // Get maintenance history
  const history = await MaintenanceLog.getMaintenanceHistory(
    vehicleId,
    vehicleType,
    { limit: 5 }
  );

  return {
    vehicle: {
      id: vehicle._id,
      plateNumber: vehicle.plateNumber,
      type: vehicleType,
      mileage: vehicle.mileage,
      status: vehicle.status,
    },
    alerts,
    recentMaintenance: history.logs,
    overallStatus:
      alerts.length === 0
        ? "GOOD"
        : alerts.some((a) => a.status === "OVERDUE")
        ? "NEEDS_ATTENTION"
        : "DUE_SOON",
  };
};

export const getUpcomingMaintenance = async (daysAhead = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  const alerts = await getAllMaintenanceAlerts();

  // Filter for items due within the specified timeframe
  const upcoming = alerts.alerts.filter((alert) => {
    if (alert.nextMaintenanceDate) {
      return new Date(alert.nextMaintenanceDate) <= cutoffDate;
    }
    // Include all overdue and due soon items
    return alert.status === "OVERDUE" || alert.status === "DUE_SOON";
  });

  return upcoming;
};

export default {
  checkVehicleMaintenance,
  getAllMaintenanceAlerts,
  getVehicleMaintenanceStatus,
  getUpcomingMaintenance,
};
