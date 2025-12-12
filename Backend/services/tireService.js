import Tire from "../models/Tire.js";
import Truck from "../models/Truck.js";
import Trailer from "../models/Trailer.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS, TIRE_STATUS, VEHICLE_TYPE } from "../utils/constants.js";

// Create a new tire
export const createTire = async (tireData) => {
  // Check if reference already exists
  const existingTire = await Tire.findOne({
    reference: tireData.reference,
  });

  if (existingTire) {
    throw new CustomError(
      "Tire reference already exists",
      HTTP_STATUS.CONFLICT
    );
  }

  // Validate vehicle exists
  const VehicleModel =
    tireData.vehicleType === VEHICLE_TYPE.TRUCK ? Truck : Trailer;
  const vehicle = await VehicleModel.findById(tireData.vehicle);

  if (!vehicle) {
    throw new CustomError(
      `${tireData.vehicleType} not found`,
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Check if position is already occupied for this vehicle
  const existingPosition = await Tire.findOne({
    vehicle: tireData.vehicle,
    vehicleType: tireData.vehicleType,
    position: tireData.position,
  });

  if (existingPosition) {
    throw new CustomError(
      `Position ${tireData.position} is already occupied on this vehicle`,
      HTTP_STATUS.CONFLICT
    );
  }

  // Set currentKm to vehicle's current mileage
  if (!tireData.currentKm) {
    tireData.currentKm = vehicle.mileage || tireData.installationKm;
  }

  const tire = await Tire.create(tireData);
  return tire;
};

// Get all tires with pagination and filtering
export const getAllTires = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    vehicleType,
    position,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build query
  const query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by vehicle type
  if (vehicleType) {
    query.vehicleType = vehicleType;
  }

  // Filter by position
  if (position) {
    query.position = position;
  }

  // Search by reference, brand, or model
  if (search) {
    query.$or = [
      { reference: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const [tires, total] = await Promise.all([
    Tire.find(query)
      .populate("vehicle", "plateNumber brand model mileage")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Tire.countDocuments(query),
  ]);

  return {
    tires,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Get tire by ID
export const getTireById = async (tireId) => {
  const tire = await Tire.findById(tireId).populate(
    "vehicle",
    "plateNumber brand model mileage"
  );

  if (!tire) {
    throw new CustomError("Tire not found", HTTP_STATUS.NOT_FOUND);
  }

  return tire;
};

// Update tire
export const updateTire = async (tireId, updateData) => {
  // Check if tire exists
  const tire = await Tire.findById(tireId);

  if (!tire) {
    throw new CustomError("Tire not found", HTTP_STATUS.NOT_FOUND);
  }

  // If updating reference, check for duplicates
  if (updateData.reference && updateData.reference !== tire.reference) {
    const existingRef = await Tire.findOne({
      reference: updateData.reference,
      _id: { $ne: tireId },
    });

    if (existingRef) {
      throw new CustomError(
        "Tire reference already exists",
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // If updating position, check for conflicts
  if (updateData.position && updateData.position !== tire.position) {
    const existingPosition = await Tire.findOne({
      vehicle: tire.vehicle,
      vehicleType: tire.vehicleType,
      position: updateData.position,
      _id: { $ne: tireId },
    });

    if (existingPosition) {
      throw new CustomError(
        `Position ${updateData.position} is already occupied on this vehicle`,
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // Update tire
  const updatedTire = await Tire.findByIdAndUpdate(tireId, updateData, {
    new: true,
    runValidators: true,
  }).populate("vehicle", "plateNumber brand model mileage");

  return updatedTire;
};

// Delete tire
export const deleteTire = async (tireId) => {
  const tire = await Tire.findById(tireId);

  if (!tire) {
    throw new CustomError("Tire not found", HTTP_STATUS.NOT_FOUND);
  }

  await Tire.findByIdAndDelete(tireId);

  return tire;
};

// Get tires by vehicle
export const getTiresByVehicle = async (vehicleId, vehicleType) => {
  // Validate vehicle exists
  const VehicleModel = vehicleType === VEHICLE_TYPE.TRUCK ? Truck : Trailer;
  const vehicle = await VehicleModel.findById(vehicleId);

  if (!vehicle) {
    throw new CustomError(`${vehicleType} not found`, HTTP_STATUS.NOT_FOUND);
  }

  const tires = await Tire.find({
    vehicle: vehicleId,
    vehicleType: vehicleType,
  }).sort({ position: 1 });

  return tires;
};

// Update tire mileage
export const updateTireKm = async (tireId, currentKm) => {
  const tire = await Tire.findById(tireId);

  if (!tire) {
    throw new CustomError("Tire not found", HTTP_STATUS.NOT_FOUND);
  }

  await tire.updateCurrentKm(currentKm);

  return tire;
};

// Check tire wear and update status
export const checkTireWear = async (tireId) => {
  const tire = await Tire.findById(tireId);

  if (!tire) {
    throw new CustomError("Tire not found", HTTP_STATUS.NOT_FOUND);
  }

  tire.checkWear();
  await tire.save();

  return tire;
};

// Get tires needing replacement
export const getTiresNeedingReplacement = async () => {
  const tires = await Tire.find({ status: TIRE_STATUS.TO_REPLACE })
    .populate("vehicle", "plateNumber brand model")
    .sort({ currentKm: -1 });

  return tires;
};

// Get tire statistics
export const getTireStatistics = async () => {
  const stats = await Tire.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalTires = await Tire.countDocuments();

  return {
    total: totalTires,
    byStatus: stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};
