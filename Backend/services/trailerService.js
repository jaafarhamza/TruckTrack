import Trailer from "../models/Trailer.js";
import { VEHICLE_STATUS } from "../utils/constants.js";

// Get all trailers

export const getAllTrailers = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    type = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query = {};

  // Search

  if (search) {
    query.$or = [
      { plateNumber: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by type
  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [trailers, totalItems] = await Promise.all([
    Trailer.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
    Trailer.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    trailers,
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

// Get trailer by ID

export const getTrailerById = async (id) => {
  const trailer = await Trailer.findById(id);
  if (!trailer) {
    throw new Error("Trailer not found");
  }
  return trailer;
};

// Create new trailer

export const createTrailer = async (trailerData) => {
  // Check for duplicate plate number
  const existingPlate = await Trailer.findOne({
    plateNumber: trailerData.plateNumber.toUpperCase(),
  });
  if (existingPlate) {
    throw new Error(
      `Trailer with plate number ${trailerData.plateNumber} already exists`
    );
  }

  // Check for duplicate serial number

  if (trailerData.serialNumber) {
    const existingSerial = await Trailer.findOne({
      serialNumber: trailerData.serialNumber.toUpperCase(),
    });
    if (existingSerial) {
      throw new Error(
        `Trailer with serial number ${trailerData.serialNumber} already exists`
      );
    }
  }

  const trailer = new Trailer(trailerData);
  await trailer.save();
  return trailer;
};

// Update trailer

export const updateTrailer = async (id, updateData) => {
  const trailer = await Trailer.findById(id);
  if (!trailer) {
    throw new Error("Trailer not found");
  }

  // Check for duplicate plate number
  if (
    updateData.plateNumber &&
    updateData.plateNumber !== trailer.plateNumber
  ) {
    const existingPlate = await Trailer.findOne({
      plateNumber: updateData.plateNumber.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingPlate) {
      throw new Error(
        `Trailer with plate number ${updateData.plateNumber} already exists`
      );
    }
  }

  // Check for duplicate serial number

  if (
    updateData.serialNumber &&
    updateData.serialNumber !== trailer.serialNumber
  ) {
    const existingSerial = await Trailer.findOne({
      serialNumber: updateData.serialNumber.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingSerial) {
      throw new Error(
        `Trailer with serial number ${updateData.serialNumber} already exists`
      );
    }
  }

  Object.assign(trailer, updateData);
  await trailer.save();
  return trailer;
};

// Delete trailer
export const deleteTrailer = async (id) => {
  const trailer = await Trailer.findById(id);
  if (!trailer) {
    throw new Error("Trailer not found");
  }

  // Soft delete: set status to OUT_OF_SERVICE
  trailer.status = VEHICLE_STATUS.OUT_OF_SERVICE;
  await trailer.save();
  return trailer;
};

// Get available trailers

export const getAvailableTrailers = async () => {
  return await Trailer.find({ status: VEHICLE_STATUS.AVAILABLE }).sort({
    plateNumber: 1,
  });
};
