import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import Truck from "../models/Truck.js";
import Trailer from "../models/Trailer.js";
import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import {
  HTTP_STATUS,
  TRIP_STATUS,
  VEHICLE_STATUS,
  USER_ROLES,
} from "../utils/constants.js";

// Get all trips
export const getAllTrips = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    driver,
    truck,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const query = {};

  // Filter by status
  if (status && Object.values(TRIP_STATUS).includes(status)) {
    query.status = status;
  }

  // Filter by driver
  if (driver) {
    query.driver = driver;
  }

  // Filter by truck
  if (truck) {
    query.truck = truck;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.departureDate = {};
    if (startDate) query.departureDate.$gte = new Date(startDate);
    if (endDate) query.departureDate.$lte = new Date(endDate);
  }

  // Search
  if (search) {
    query.$or = [
      { tripNumber: { $regex: search, $options: "i" } },
      { "origin.city": { $regex: search, $options: "i" } },
      { "destination.city": { $regex: search, $options: "i" } },
      { cargo: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [trips, totalItems] = await Promise.all([
    Trip.find(query)
      .populate("driver", "firstName lastName username email")
      .populate("truck", "plateNumber brand model")
      .populate("trailer", "plateNumber type")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Trip.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    trips,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Get trip by ID
export const getTripById = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate("driver", "firstName lastName username email phone")
    .populate("truck", "plateNumber brand model mileage status")
    .populate("trailer", "plateNumber type brand model status");

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  return trip;
};

// Get trips by driver
export const getTripsByDriver = async (driverId, options = {}) => {
  const { status, page = 1, limit = 10 } = options;

  const query = { driver: driverId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [trips, totalItems] = await Promise.all([
    Trip.find(query)
      .populate("truck", "plateNumber brand model")
      .populate("trailer", "plateNumber type")
      .sort({ departureDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Trip.countDocuments(query),
  ]);

  return {
    trips,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit),
    },
  };
};

// Get specific trip by ID for driver
export const getDriverTripById = async (driverId, tripId) => {
  const trip = await Trip.findOne({ _id: tripId, driver: driverId })
    .populate("driver", "firstName lastName username email phone")
    .populate("truck", "plateNumber brand model mileage status")
    .populate("trailer", "plateNumber type brand model status");

  if (!trip) {
    throw new CustomError(
      "Trip not found or you don't have access",
      HTTP_STATUS.NOT_FOUND
    );
  }

  return trip;
};

// Start trip by driver 
export const startDriverTrip = async (driverId, tripId, startKm) => {
  const trip = await Trip.findOne({ _id: tripId, driver: driverId });

  if (!trip) {
    throw new CustomError(
      "Trip not found or you don't have access",
      HTTP_STATUS.NOT_FOUND
    );
  }

  await trip.start(startKm);

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model mileage" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Complete trip by driver 
export const completeDriverTrip = async (driverId, tripId, endKm, remarks) => {
  const trip = await Trip.findOne({ _id: tripId, driver: driverId });

  if (!trip) {
    throw new CustomError(
      "Trip not found or you don't have access",
      HTTP_STATUS.NOT_FOUND
    );
  }

  await trip.complete(endKm, remarks);

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model mileage" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Get driver's trip stats
export const getDriverTripStats = async (driverId) => {
  const driverObjectId = new mongoose.Types.ObjectId(driverId);

  const [total, planned, inProgress, completed, totalDistance] =
    await Promise.all([
      Trip.countDocuments({ driver: driverId }),
      Trip.countDocuments({ driver: driverId, status: TRIP_STATUS.PLANNED }),
      Trip.countDocuments({
        driver: driverId,
        status: TRIP_STATUS.IN_PROGRESS,
      }),
      Trip.countDocuments({ driver: driverId, status: TRIP_STATUS.COMPLETED }),
      Trip.aggregate([
        { $match: { driver: driverObjectId, status: TRIP_STATUS.COMPLETED } },
        {
          $group: {
            _id: null,
            totalDistance: {
              $sum: { $subtract: ["$endKm", "$startKm"] },
            },
          },
        },
      ]),
    ]);

  return {
    total,
    planned,
    inProgress,
    completed,
    totalDistance: totalDistance[0]?.totalDistance || 0,
  };
};

// Get trip stats
export const getTripStats = async () => {
  const [total, planned, inProgress, completed, cancelled] = await Promise.all([
    Trip.countDocuments(),
    Trip.countDocuments({ status: TRIP_STATUS.PLANNED }),
    Trip.countDocuments({ status: TRIP_STATUS.IN_PROGRESS }),
    Trip.countDocuments({ status: TRIP_STATUS.COMPLETED }),
    Trip.countDocuments({ status: TRIP_STATUS.CANCELLED }),
  ]);

  return { total, planned, inProgress, completed, cancelled };
};

// Create trip
export const createTrip = async (tripData) => {
  const { driver, truck, trailer } = tripData;

  // Validate driver exists and is a driver
  const driverUser = await User.findById(driver);
  if (!driverUser) {
    throw new CustomError("Driver not found", HTTP_STATUS.NOT_FOUND);
  }
  if (driverUser.role !== USER_ROLES.DRIVER) {
    throw new CustomError("User is not a driver", HTTP_STATUS.BAD_REQUEST);
  }
  if (!driverUser.active) {
    throw new CustomError("Driver is not active", HTTP_STATUS.BAD_REQUEST);
  }

  // Validate truck exists and is available
  const truckDoc = await Truck.findById(truck);
  if (!truckDoc) {
    throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
  }
  if (truckDoc.status !== VEHICLE_STATUS.AVAILABLE) {
    throw new CustomError(
      `Truck is not available (current status: ${truckDoc.status})`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Validate trailer
  if (trailer) {
    const trailerDoc = await Trailer.findById(trailer);
    if (!trailerDoc) {
      throw new CustomError("Trailer not found", HTTP_STATUS.NOT_FOUND);
    }
    if (trailerDoc.status !== VEHICLE_STATUS.AVAILABLE) {
      throw new CustomError(
        `Trailer is not available (current status: ${trailerDoc.status})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  const trip = new Trip(tripData);
  await trip.save();

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Update trip
export const updateTrip = async (tripId, updateData) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  // Only allow updates on PLANNED trips
  if (trip.status !== TRIP_STATUS.PLANNED) {
    throw new CustomError(
      "Cannot update trip that is not in PLANNED status",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // If changing truck, validate new truck
  if (updateData.truck && updateData.truck !== trip.truck.toString()) {
    const truckDoc = await Truck.findById(updateData.truck);
    if (!truckDoc) {
      throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
    }
    if (truckDoc.status !== VEHICLE_STATUS.AVAILABLE) {
      throw new CustomError(
        `Truck is not available (current status: ${truckDoc.status})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // If changing driver, validate new driver
  if (updateData.driver && updateData.driver !== trip.driver.toString()) {
    const driverUser = await User.findById(updateData.driver);
    if (!driverUser) {
      throw new CustomError("Driver not found", HTTP_STATUS.NOT_FOUND);
    }
    if (driverUser.role !== USER_ROLES.DRIVER) {
      throw new CustomError("User is not a driver", HTTP_STATUS.BAD_REQUEST);
    }
  }

  // If changing trailer, validate new trailer
  if (updateData.trailer && updateData.trailer !== trip.trailer?.toString()) {
    const trailerDoc = await Trailer.findById(updateData.trailer);
    if (!trailerDoc) {
      throw new CustomError("Trailer not found", HTTP_STATUS.NOT_FOUND);
    }
    if (trailerDoc.status !== VEHICLE_STATUS.AVAILABLE) {
      throw new CustomError(
        `Trailer is not available (current status: ${trailerDoc.status})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  Object.assign(trip, updateData);
  await trip.save();

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Start trip
export const startTrip = async (tripId, startKm) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  await trip.start(startKm);

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Complete trip
export const completeTrip = async (tripId, endKm, remarks) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  await trip.complete(endKm, remarks);

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Cancel trip
export const cancelTrip = async (tripId, reason) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  await trip.cancel(reason);

  return trip.populate([
    { path: "driver", select: "firstName lastName username email" },
    { path: "truck", select: "plateNumber brand model" },
    { path: "trailer", select: "plateNumber type" },
  ]);
};

// Update fuel for trip
export const updateTripFuel = async (tripId, volume, cost) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  if (trip.status !== TRIP_STATUS.IN_PROGRESS) {
    throw new CustomError(
      "Can only update fuel for trips in progress",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  await trip.updateFuel(volume, cost);
  return trip;
};

// Delete trip
export const deleteTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new CustomError("Trip not found", HTTP_STATUS.NOT_FOUND);
  }

  if (![TRIP_STATUS.PLANNED, TRIP_STATUS.CANCELLED].includes(trip.status)) {
    throw new CustomError(
      "Can only delete trips in PLANNED or CANCELLED status",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  await Trip.findByIdAndDelete(tripId);
  return true;
};
