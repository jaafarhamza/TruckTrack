import mongoose from "mongoose";
import { VEHICLE_STATUS } from "../utils/constants.js";

const truckSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, "Plate number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9-]+$/,
        "Plate number can only contain letters, numbers, and hyphens",
      ],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      minlength: [2, "Brand must be at least 2 characters"],
      maxlength: [50, "Brand cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      minlength: [1, "Model must be at least 1 character"],
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be 1900 or later"],
      max: [new Date().getFullYear() + 1, "Year cannot be more than next year"],
    },
    mileage: {
      type: Number,
      required: [true, "Mileage is required"],
      min: [0, "Mileage cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(VEHICLE_STATUS),
        message: "{VALUE} is not a valid status",
      },
      default: VEHICLE_STATUS.AVAILABLE,
    },
    loadCapacity: {
      type: Number,
      required: [true, "Load capacity is required"],
      min: [0, "Load capacity cannot be negative"],
    },
    averageConsumption: {
      type: Number,
      min: [0, "Average consumption cannot be negative"],
      default: 0,
    },
    purchaseDate: {
      type: Date,
      required: [true, "Purchase date is required"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
    },
    serialNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
truckSchema.index({ plateNumber: 1 });
truckSchema.index({ status: 1 });
truckSchema.index({ brand: 1, model: 1 });

// Virtual for truck age
truckSchema.virtual("age").get(function () {
  return new Date().getFullYear() - this.year;
});

// Method to check if truck is available
truckSchema.methods.isAvailable = function () {
  return this.status === VEHICLE_STATUS.AVAILABLE;
};

// Method to update mileage
truckSchema.methods.updateMileage = function (newMileage) {
  if (newMileage < this.mileage) {
    throw new Error(
      `New mileage (${newMileage}) cannot be less than current mileage (${this.mileage})`
    );
  }
  this.mileage = newMileage;
  return this.save();
};

// Pre-save middleware to validate mileage
truckSchema.pre("save", function (next) {
  if (this.isModified("mileage") && !this.isNew) {
    const originalMileage = this._original?.mileage || 0;
    if (this.mileage < originalMileage) {
      return next(
        new Error("Mileage cannot decrease. It must always increase.")
      );
    }
  }
  next();
});

// Store original values before update
truckSchema.pre("save", function (next) {
  if (!this.isNew) {
    this._original = this.toObject();
  }
  next();
});

// Ensure virtuals are included in JSON
truckSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._original;
    return ret;
  },
});

truckSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._original;
    return ret;
  },
});

const Truck = mongoose.models.Truck || mongoose.model("Truck", truckSchema);

export default Truck;
