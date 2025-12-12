import mongoose from "mongoose";
import {
  TIRE_STATUS,
  TIRE_POSITION,
  VEHICLE_TYPE,
} from "../utils/constants.js";

const tireSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, "Tire reference is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Vehicle reference is required"],
      refPath: "vehicleType",
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: Object.values(VEHICLE_TYPE),
        message: "{VALUE} is not a valid vehicle type",
      },
    },
    position: {
      type: String,
      required: [true, "Tire position is required"],
      enum: {
        values: Object.values(TIRE_POSITION),
        message: "{VALUE} is not a valid tire position",
      },
    },
    installationDate: {
      type: Date,
      required: [true, "Installation date is required"],
    },
    installationKm: {
      type: Number,
      required: [true, "Installation mileage is required"],
      min: [0, "Installation mileage cannot be negative"],
    },
    currentKm: {
      type: Number,
      required: [true, "Current mileage is required"],
      min: [0, "Current mileage cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TIRE_STATUS),
        message: "{VALUE} is not a valid tire status",
      },
      default: TIRE_STATUS.NEW,
    },
    brand: {
      type: String,
      required: [true, "Tire brand is required"],
      trim: true,
      minlength: [2, "Brand must be at least 2 characters"],
      maxlength: [50, "Brand cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: [true, "Tire model is required"],
      trim: true,
      minlength: [1, "Model must be at least 1 character"],
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    dimension: {
      type: String,
      required: [true, "Tire dimension is required"],
      trim: true,
      match: [
        /^[0-9]+\/[0-9]+R[0-9]+(\.[0-9]+)?$/,
        "Dimension must be in format like 315/80R22.5",
      ],
    },
    pressure: {
      type: Number,
      min: [0, "Pressure cannot be negative"],
      max: [200, "Pressure seems unrealistic (max 200 PSI)"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tireSchema.index({ vehicle: 1, vehicleType: 1 });
tireSchema.index({ status: 1 });
tireSchema.index({ vehicle: 1, position: 1 });

// Virtual for kilometers traveled
tireSchema.virtual("kmTraveled").get(function () {
  return this.currentKm - this.installationKm;
});

// Virtual for tire age in days
tireSchema.virtual("age").get(function () {
  const now = new Date();
  const installation = new Date(this.installationDate);
  const diffTime = Math.abs(now - installation);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to calculate kilometers traveled
tireSchema.methods.calculateKmTraveled = function () {
  return this.currentKm - this.installationKm;
};

// Method to check tire wear and update status
tireSchema.methods.checkWear = function () {
  const kmTraveled = this.calculateKmTraveled();

  if (kmTraveled > 80000) {
    this.status = TIRE_STATUS.TO_REPLACE;
  } else if (kmTraveled > 60000) {
    this.status = TIRE_STATUS.WORN;
  } else if (kmTraveled > 30000) {
    this.status = TIRE_STATUS.GOOD;
  } else {
    this.status = TIRE_STATUS.NEW;
  }

  return this.status;
};

// Method to check if tire needs replacement
tireSchema.methods.needsReplacement = function () {
  return this.status === TIRE_STATUS.TO_REPLACE;
};

// Method to update current mileage and recalculate wear
tireSchema.methods.updateCurrentKm = function (newKm) {
  if (newKm < this.currentKm) {
    throw new Error(
      `New mileage (${newKm}) cannot be less than current mileage (${this.currentKm})`
    );
  }

  this.currentKm = newKm;
  this.checkWear();
  return this.save();
};

// currentKm must be >= installationKm
tireSchema.pre("save", function (next) {
  if (this.currentKm < this.installationKm) {
    return next(
      new Error("Current mileage cannot be less than installation mileage")
    );
  }
  next();
});

// Auto-update status based on km traveled
tireSchema.pre("save", function (next) {
  if (this.isModified("currentKm") || this.isNew) {
    this.checkWear();
  }
  next();
});

// Ensure virtuals are included in JSON
tireSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});

tireSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});

const Tire = mongoose.models.Tire || mongoose.model("Tire", tireSchema);

export default Tire;
