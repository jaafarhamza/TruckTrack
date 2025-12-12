import mongoose from "mongoose";
import { VEHICLE_STATUS, TRAILER_TYPES } from "../utils/constants.js";

const trailerSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: [true, "Trailer type is required"],
      enum: {
        values: Object.values(TRAILER_TYPES),
        message: "{VALUE} is not a valid trailer type",
      },
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
    length: {
      type: Number,
      required: [true, "Length is required"],
      min: [0, "Length cannot be negative"],
    },
    width: {
      type: Number,
      required: [true, "Width is required"],
      min: [0, "Width cannot be negative"],
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [0, "Height cannot be negative"],
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
    serialNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
    },
    axles: {
      type: Number,
      required: [true, "Number of axles is required"],
      min: [1, "Trailer must have at least 1 axle"],
      max: [5, "Trailer cannot have more than 5 axles"],
      default: 2,
    },
    tareWeight: {
      type: Number,
      min: [0, "Tare weight cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trailerSchema.index({ status: 1 });
trailerSchema.index({ type: 1 });
trailerSchema.index({ brand: 1, model: 1 });

// Virtual for trailer age
trailerSchema.virtual("age").get(function () {
  return new Date().getFullYear() - this.year;
});

// Virtual for volume in cubic meters
trailerSchema.virtual("volume").get(function () {
  return (this.length * this.width * this.height).toFixed(2);
});

// Virtual for maximum payload
trailerSchema.virtual("maxPayload").get(function () {
  return this.loadCapacity - this.tareWeight;
});

// Method to check if trailer is available
trailerSchema.methods.isAvailable = function () {
  return this.status === VEHICLE_STATUS.AVAILABLE;
};

// Method to check if trailer can carry a specific load
trailerSchema.methods.canCarryLoad = function (weight) {
  if (weight < 0) {
    throw new Error("Weight cannot be negative");
  }
  return weight <= this.maxPayload;
};

// validate load capacity vs tare weight
trailerSchema.pre("save", function (next) {
  if (this.tareWeight > this.loadCapacity) {
    return next(new Error("Tare weight cannot be greater than load capacity"));
  }
  next();
});

// validate dimensions
trailerSchema.pre("save", function (next) {
  if (this.length <= 0 || this.width <= 0 || this.height <= 0) {
    return next(
      new Error(
        "All dimensions (length, width, height) must be positive numbers"
      )
    );
  }
  next();
});

// Ensure virtuals are included in JSON
trailerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.volume = parseFloat(ret.volume);
    return ret;
  },
});

trailerSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.volume = parseFloat(ret.volume);
    return ret;
  },
});

const Trailer =
  mongoose.models.Trailer || mongoose.model("Trailer", trailerSchema);

export default Trailer;
