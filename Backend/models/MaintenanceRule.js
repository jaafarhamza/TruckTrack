import mongoose from "mongoose";
import { MAINTENANCE_TYPE } from "../utils/constants.js";

const maintenanceRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPE),
      required: [true, "Maintenance type is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    kmInterval: {
      type: Number,
      min: [0, "Km interval cannot be negative"],
    },
    monthInterval: {
      type: Number,
      min: [1, "Month interval must be at least 1"],
      max: [60, "Month interval cannot exceed 60 months"],
    },
    estimatedCost: {
      type: Number,
      min: [0, "Estimated cost cannot be negative"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
maintenanceRuleSchema.index({ type: 1, active: 1 });

// Instance methods
maintenanceRuleSchema.methods.activate = async function () {
  this.active = true;
  return this.save();
};

maintenanceRuleSchema.methods.deactivate = async function () {
  this.active = false;
  return this.save();
};

// Static methods
maintenanceRuleSchema.statics.getActiveRulesByType = async function (type) {
  return this.find({ type, active: true });
};

const MaintenanceRule = mongoose.model(
  "MaintenanceRule",
  maintenanceRuleSchema
);

export default MaintenanceRule;
