import mongoose from "mongoose";
import { FUEL_TYPE } from "../utils/constants.js";

const fuelSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Vehicle is required"],
      refPath: "vehicleModel",
    },
    vehicleModel: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: ["Truck", "Trailer"],
        message: "{VALUE} is not a valid vehicle type",
      },
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    date: {
      type: Date,
      required: [true, "Refueling date is required"],
      default: Date.now,
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Refueling date cannot be in the future",
      },
    },
    volume: {
      type: Number,
      required: [true, "Fuel volume is required"],
      min: [1, "Volume must be at least 1 liter"],
      max: [2000, "Volume cannot exceed 2000 liters"],
    },
    unitCost: {
      type: Number,
      required: [true, "Unit cost is required"],
      min: [0.1, "Unit cost must be at least 0.1"],
      max: [10, "Unit cost cannot exceed 10"],
    },
    totalCost: {
      type: Number,
      required: [true, "Total cost is required"],
      min: [0, "Total cost cannot be negative"],
    },
    currentKm: {
      type: Number,
      required: [true, "Current kilometer reading is required"],
      min: [0, "Current km cannot be negative"],
    },

    station: {
      type: String,
      required: [true, "Fuel station is required"],
      trim: true,
      minlength: [2, "Station name must be at least 2 characters"],
      maxlength: [100, "Station name cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters"],
      maxlength: [100, "City cannot exceed 100 characters"],
    },

    invoice: {
      type: String,
      trim: true,
      maxlength: [50, "Invoice number cannot exceed 50 characters"],
    },
    fuelType: {
      type: String,
      required: [true, "Fuel type is required"],
      enum: {
        values: Object.values(FUEL_TYPE),
        message: "{VALUE} is not a valid fuel type",
      },
      default: FUEL_TYPE.DIESEL,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Distance traveled since last refuel
fuelSchema.virtual("distanceTraveled").get(function () {
  return null;
});

// Fuel efficiency (km/liter)
fuelSchema.virtual("fuelEfficiency").get(function () {
  return null;
});

// Cost per kilometer
fuelSchema.virtual("costPerKm").get(function () {
  return null;
});

// Auto-calculate total cost
fuelSchema.pre("save", function (next) {
  if (!this.totalCost && this.volume && this.unitCost) {
    this.totalCost = this.volume * this.unitCost;
  }

  // Validate total cost matches volume * unitCost
  const calculatedCost = this.volume * this.unitCost;
  const difference = Math.abs(this.totalCost - calculatedCost);

  if (difference > 0.01) {
    return next(
      new Error(
        `Total cost (${this.totalCost}) does not match volume × unit cost (${calculatedCost})`
      )
    );
  }

  next();
});

// Validate vehicle exists and currentKm
fuelSchema.pre("save", async function (next) {
  if (this.isModified("vehicle") || this.isModified("currentKm")) {
    try {
      const VehicleModel = mongoose.model(this.vehicleModel);
      const vehicle = await VehicleModel.findById(this.vehicle);

      if (!vehicle) {
        return next(
          new Error(`${this.vehicleModel} with ID ${this.vehicle} not found`)
        );
      }

      // Validate currentKm
      if (this.currentKm < vehicle.mileage) {
        return next(
          new Error(
            `Current km (${this.currentKm}) cannot be less than vehicle's mileage (${vehicle.mileage})`
          )
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Calculate cost
fuelSchema.methods.calculateCost = function () {
  return this.volume * this.unitCost;
};

// Get average consumption
// Returns liters per 100 km
fuelSchema.methods.getAverageConsumption = async function () {
  const previousRefuel = await this.constructor
    .findOne({
      vehicle: this.vehicle,
      vehicleModel: this.vehicleModel,
      date: { $lt: this.date },
    })
    .sort({ date: -1 });

  if (!previousRefuel) {
    return null;
  }

  const distanceTraveled = this.currentKm - previousRefuel.currentKm;

  if (distanceTraveled <= 0) {
    return null;
  }

  // Return liters per 100 km
  return (this.volume / distanceTraveled) * 100;
};

// Get previous refuel record
fuelSchema.methods.getPreviousRefuel = async function () {
  return await this.constructor
    .findOne({
      vehicle: this.vehicle,
      vehicleModel: this.vehicleModel,
      date: { $lt: this.date },
    })
    .sort({ date: -1 });
};

// Calculate efficiency (km/liter)
fuelSchema.methods.calculateEfficiency = async function () {
  const previousRefuel = await this.getPreviousRefuel();

  if (!previousRefuel) {
    return null;
  }

  const distanceTraveled = this.currentKm - previousRefuel.currentKm;

  if (distanceTraveled <= 0 || this.volume <= 0) {
    return null;
  }

  return distanceTraveled / this.volume; // km/liter
};

// Calculate cost per km
fuelSchema.methods.calculateCostPerKm = async function () {
  const previousRefuel = await this.getPreviousRefuel();

  if (!previousRefuel) {
    return null;
  }

  const distanceTraveled = this.currentKm - previousRefuel.currentKm;

  if (distanceTraveled <= 0) {
    return null;
  }

  return this.totalCost / distanceTraveled;
};

// Indexes for performance
fuelSchema.index({ vehicle: 1, date: -1 });
fuelSchema.index({ vehicleModel: 1, date: -1 });
fuelSchema.index({ trip: 1 });
fuelSchema.index({ date: -1 });
fuelSchema.index({ currentKm: 1 });
fuelSchema.index({ station: 1 });
fuelSchema.index({ city: 1 });

const Fuel = mongoose.model("Fuel", fuelSchema);

export default Fuel;
