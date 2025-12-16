import mongoose from "mongoose";
import { TRIP_STATUS, VEHICLE_STATUS } from "../utils/constants.js";

// Address
const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: [200, "Street cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, "Postal code cannot exceed 20 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

// Trip
const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      unique: true,
      uppercase: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver is required"],
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: [true, "Truck is required"],
    },
    trailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trailer",
    },
    origin: {
      type: addressSchema,
      required: [true, "Origin address is required"],
    },
    destination: {
      type: addressSchema,
      required: [true, "Destination address is required"],
    },
    departureDate: {
      type: Date,
      required: [true, "Departure date is required"],
    },
    arrivalDate: {
      type: Date,
      required: [true, "Arrival date is required"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TRIP_STATUS),
        message: "{VALUE} is not a valid trip status",
      },
      default: TRIP_STATUS.PLANNED,
    },
    startKm: {
      type: Number,
      min: [0, "Start km cannot be negative"],
    },
    endKm: {
      type: Number,
      min: [0, "End km cannot be negative"],
    },
    fuelConsumed: {
      type: Number,
      min: [0, "Fuel consumed cannot be negative"],
      default: 0,
    },
    fuelCost: {
      type: Number,
      min: [0, "Fuel cost cannot be negative"],
      default: 0,
    },
    cargo: {
      type: String,
      trim: true,
      maxlength: [500, "Cargo description cannot exceed 500 characters"],
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, "Remarks cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ status: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ truck: 1 });
tripSchema.index({ departureDate: 1 });
tripSchema.index({ tripNumber: 1 });

// distanceTraveled
tripSchema.virtual("distanceTraveled").get(function () {
  if (this.startKm != null && this.endKm != null) {
    return this.endKm - this.startKm;
  }
  return null;
});

// Auto-generate tripNumber
tripSchema.pre("save", async function (next) {
  if (this.isNew && !this.tripNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Count trips this month
    const count = await mongoose.model("Trip").countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      },
    });

    this.tripNumber = `TRP-${year}${month}-${String(count + 1).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

// Validate dates
tripSchema.pre("save", function (next) {
  if (this.arrivalDate < this.departureDate) {
    return next(new Error("Arrival date must be after departure date"));
  }
  next();
});

// Validate mileage
tripSchema.pre("save", function (next) {
  if (this.endKm != null && this.startKm != null) {
    if (this.endKm < this.startKm) {
      return next(new Error("End km must be greater than start km"));
    }
  }
  next();
});

// validateTransition
tripSchema.methods.validateTransition = function (newStatus) {
  const allowedTransitions = {
    [TRIP_STATUS.PLANNED]: [TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.CANCELLED],
    [TRIP_STATUS.IN_PROGRESS]: [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED],
    [TRIP_STATUS.COMPLETED]: [],
    [TRIP_STATUS.CANCELLED]: [],
  };

  return allowedTransitions[this.status]?.includes(newStatus) || false;
};

// canStart
tripSchema.methods.canStart = function () {
  return this.status === TRIP_STATUS.PLANNED;
};

// assignDriver
tripSchema.methods.assignDriver = async function (userId) {
  this.driver = userId;
  return this.save();
};

// updateStatus
tripSchema.methods.updateStatus = async function (newStatus) {
  if (!this.validateTransition(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  this.status = newStatus;
  return this.save();
};

// updateMileage
tripSchema.methods.updateMileage = async function (startKm, endKm) {
  if (startKm != null) {
    this.startKm = startKm;
  }
  if (endKm != null) {
    if (this.startKm != null && endKm < this.startKm) {
      throw new Error("End km must be greater than start km");
    }
    this.endKm = endKm;
  }
  return this.save();
};

// updateFuel
tripSchema.methods.updateFuel = async function (volume, cost) {
  if (volume != null) {
    this.fuelConsumed = (this.fuelConsumed || 0) + volume;
  }
  if (cost != null) {
    this.fuelCost = (this.fuelCost || 0) + cost;
  }
  return this.save();
};

// calculateDistance
tripSchema.methods.calculateDistance = function () {
  return this.distanceTraveled;
};

// complete
tripSchema.methods.complete = async function (endKm, remarks) {
  if (this.status !== TRIP_STATUS.IN_PROGRESS) {
    throw new Error("Trip must be in progress to complete");
  }

  this.status = TRIP_STATUS.COMPLETED;
  this.endKm = endKm;
  if (remarks) {
    this.remarks = remarks;
  }

  // Update truck mileage and status
  const Truck = mongoose.model("Truck");
  await Truck.findByIdAndUpdate(this.truck, {
    status: VEHICLE_STATUS.AVAILABLE,
    mileage: endKm,
  });

  // Update trailer status if exists
  if (this.trailer) {
    const Trailer = mongoose.model("Trailer");
    await Trailer.findByIdAndUpdate(this.trailer, {
      status: VEHICLE_STATUS.AVAILABLE,
    });
  }

  return this.save();
};

// Start trip - set vehicles to ON_TRIP
tripSchema.methods.start = async function (startKm) {
  if (!this.canStart()) {
    throw new Error("Trip cannot be started from current status");
  }

  this.status = TRIP_STATUS.IN_PROGRESS;
  this.startKm = startKm;

  // Update truck status
  const Truck = mongoose.model("Truck");
  await Truck.findByIdAndUpdate(this.truck, { status: VEHICLE_STATUS.ON_TRIP });

  // Update trailer status if exists
  if (this.trailer) {
    const Trailer = mongoose.model("Trailer");
    await Trailer.findByIdAndUpdate(this.trailer, {
      status: VEHICLE_STATUS.ON_TRIP,
    });
  }

  return this.save();
};

// Cancel trip
tripSchema.methods.cancel = async function (reason) {
  if (![TRIP_STATUS.PLANNED, TRIP_STATUS.IN_PROGRESS].includes(this.status)) {
    throw new Error("Trip cannot be cancelled from current status");
  }

  const wasInProgress = this.status === TRIP_STATUS.IN_PROGRESS;

  this.status = TRIP_STATUS.CANCELLED;
  if (reason) {
    this.remarks = (this.remarks || "") + `\nCancellation reason: ${reason}`;
  }

  if (wasInProgress) {
    const Truck = mongoose.model("Truck");
    await Truck.findByIdAndUpdate(this.truck, {
      status: VEHICLE_STATUS.AVAILABLE,
    });

    if (this.trailer) {
      const Trailer = mongoose.model("Trailer");
      await Trailer.findByIdAndUpdate(this.trailer, {
        status: VEHICLE_STATUS.AVAILABLE,
      });
    }
  }

  return this.save();
};

tripSchema.set("toJSON", { virtuals: true });
tripSchema.set("toObject", { virtuals: true });

const Trip = mongoose.models.Trip || mongoose.model("Trip", tripSchema);

export default Trip;
