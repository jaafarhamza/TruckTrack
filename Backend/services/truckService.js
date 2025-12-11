import Truck from "../models/Truck.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Create a new truck
export const createTruck = async (truckData) => {
  // Check if plate number already exists
  const existingTruck = await Truck.findOne({
    plateNumber: truckData.plateNumber,
  });

  if (existingTruck) {
    throw new CustomError("Plate number already exists", HTTP_STATUS.CONFLICT);
  }

  // Check if serial number exists 
  if (truckData.serialNumber) {
    const existingSerial = await Truck.findOne({
      serialNumber: truckData.serialNumber,
    });

    if (existingSerial) {
      throw new CustomError(
        "Serial number already exists",
        HTTP_STATUS.CONFLICT
      );
    }
  }

  const truck = await Truck.create(truckData);
  return truck;
};

// Get all trucks with pagination and filtering
export const getAllTrucks = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    brand,
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

  // Filter by brand
  if (brand) {
    query.brand = brand;
  }

  // Search by plate number, brand, or model
  if (search) {
    query.$or = [
      { plateNumber: { $regex: search, $options: "i" } },
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
  const [trucks, total] = await Promise.all([
    Truck.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
    Truck.countDocuments(query),
  ]);

  return {
    trucks,
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

// Get truck by ID
export const getTruckById = async (truckId) => {
  const truck = await Truck.findById(truckId);

  if (!truck) {
    throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
  }

  return truck;
};

// Update truck
export const updateTruck = async (truckId, updateData) => {
  // Check if truck exists
  const truck = await Truck.findById(truckId);

  if (!truck) {
    throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
  }

  // If updating plate number, check for duplicates
  if (updateData.plateNumber && updateData.plateNumber !== truck.plateNumber) {
    const existingPlate = await Truck.findOne({
      plateNumber: updateData.plateNumber,
      _id: { $ne: truckId },
    });

    if (existingPlate) {
      throw new CustomError(
        "Plate number already exists",
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // If updating serial number, check for duplicates
  if (
    updateData.serialNumber &&
    updateData.serialNumber !== truck.serialNumber
  ) {
    const existingSerial = await Truck.findOne({
      serialNumber: updateData.serialNumber,
      _id: { $ne: truckId },
    });

    if (existingSerial) {
      throw new CustomError(
        "Serial number already exists",
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // Update truck
  const updatedTruck = await Truck.findByIdAndUpdate(truckId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedTruck;
};

// Soft delete truck (set status to OUT_OF_SERVICE)
export const deleteTruck = async (truckId) => {
  const truck = await Truck.findById(truckId);

  if (!truck) {
    throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
  }

  // Check if truck is currently on a trip
  if (truck.status === "ON_TRIP") {
    throw new CustomError(
      "Cannot delete truck that is currently on a trip",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Soft delete: set status to OUT_OF_SERVICE
  truck.status = "OUT_OF_SERVICE";
  await truck.save();

  return truck;
};

// Get available trucks (for trip assignment)
export const getAvailableTrucks = async () => {
  const trucks = await Truck.find({ status: "AVAILABLE" }).sort({
    plateNumber: 1,
  });

  return trucks;
};

// Update truck mileage
export const updateTruckMileage = async (truckId, newMileage) => {
  const truck = await Truck.findById(truckId);

  if (!truck) {
    throw new CustomError("Truck not found", HTTP_STATUS.NOT_FOUND);
  }

  await truck.updateMileage(newMileage);

  return truck;
};
