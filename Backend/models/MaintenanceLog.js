import mongoose from "mongoose";
import { MAINTENANCE_TYPE, VEHICLE_TYPE } from "../utils/constants.js";

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Vehicle is required"],
      refPath: "vehicleType",
    },
    vehicleType: {
      type: String,
      enum: Object.values(VEHICLE_TYPE),
      required: [true, "Vehicle type is required"],
    },
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceRule",
    },
    operationType: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPE),
      required: [true, "Operation type is required"],
    },
    date: {
      type: Date,
      required: [true, "Maintenance date is required"],
      default: Date.now,
    },
    currentKm: {
      type: Number,
      required: [true, "Current mileage is required"],
      min: [0, "Mileage cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    garage: {
      type: String,
      trim: true,
      maxlength: [100, "Garage name cannot exceed 100 characters"],
    },
    invoice: {
      type: String,
      trim: true,
    },
    technician: {
      type: String,
      trim: true,
      maxlength: [100, "Technician name cannot exceed 100 characters"],
    },
    duration: {
      type: Number, // in hours
      min: [0, "Duration cannot be negative"],
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "COMPLETED",
    },
    nextMaintenanceKm: {
      type: Number,
      min: [0, "Next maintenance km cannot be negative"],
    },
    nextMaintenanceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceLogSchema.index({ vehicle: 1, vehicleType: 1, operationType: 1 });
maintenanceLogSchema.index({ date: -1 });
maintenanceLogSchema.index({ operationType: 1 });

// Virtual for next maintenance info
maintenanceLogSchema.virtual("nextMaintenance").get(function () {
  return {
    km: this.nextMaintenanceKm,
    date: this.nextMaintenanceDate,
  };
});

// Method to calculate next maintenance
maintenanceLogSchema.methods.calculateNextMaintenance = async function (rule) {
  if (!rule) return;

  if (rule.kmInterval) {
    this.nextMaintenanceKm = this.currentKm + rule.kmInterval;
  }

  if (rule.monthInterval) {
    const nextDate = new Date(this.date);
    nextDate.setMonth(nextDate.getMonth() + rule.monthInterval);
    this.nextMaintenanceDate = nextDate;
  }

  return this.save();
};

// Static method to get last maintenance for vehicle
maintenanceLogSchema.statics.getLastMaintenance = async function (
  vehicleId,
  vehicleType,
  operationType
) {
  return this.findOne({
    vehicle: vehicleId,
    vehicleType,
    operationType,
    status: "COMPLETED",
  }).sort({ date: -1, currentKm: -1 });
};

// Static method to get maintenance history
maintenanceLogSchema.statics.getMaintenanceHistory = async function (
  vehicleId,
  vehicleType,
  options = {}
) {
  const { limit = 10, page = 1, operationType } = options;

  const query = { vehicle: vehicleId, vehicleType };
  if (operationType) query.operationType = operationType;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find(query)
      .populate("rule", "type description kmInterval monthInterval")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

maintenanceLogSchema.set("toJSON", { virtuals: true });
maintenanceLogSchema.set("toObject", { virtuals: true });

const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);

export default MaintenanceLog;
