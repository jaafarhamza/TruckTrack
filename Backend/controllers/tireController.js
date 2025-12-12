import * as tireService from "../services/tireService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Create a new tire
export const createTire = async (req, res) => {
  try {
    const tire = await tireService.createTire(req.body);

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Tire created successfully",
      { tire }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get all tires with pagination
export const getAllTires = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      vehicleType,
      position,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await tireService.getAllTires({
      page,
      limit,
      status,
      vehicleType,
      position,
      search,
      sortBy,
      sortOrder,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Tires retrieved successfully",
      result
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get tire by ID
export const getTireById = async (req, res) => {
  try {
    const tire = await tireService.getTireById(req.params.id);

    return successResponse(res, HTTP_STATUS.OK, "Tire retrieved successfully", {
      tire,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update tire
export const updateTire = async (req, res) => {
  try {
    const tire = await tireService.updateTire(req.params.id, req.body);

    return successResponse(res, HTTP_STATUS.OK, "Tire updated successfully", {
      tire,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Delete tire
export const deleteTire = async (req, res) => {
  try {
    const tire = await tireService.deleteTire(req.params.id);

    return successResponse(res, HTTP_STATUS.OK, "Tire deleted successfully", {
      tire,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get tires by vehicle
export const getTiresByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { vehicleType } = req.query;

    const tires = await tireService.getTiresByVehicle(vehicleId, vehicleType);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Vehicle tires retrieved successfully",
      { tires, count: tires.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update tire mileage
export const updateTireKm = async (req, res) => {
  try {
    const { currentKm } = req.body;
    const tire = await tireService.updateTireKm(req.params.id, currentKm);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Tire mileage updated successfully",
      { tire }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get tires needing replacement
export const getTiresNeedingReplacement = async (req, res) => {
  try {
    const tires = await tireService.getTiresNeedingReplacement();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Tires needing replacement retrieved successfully",
      { tires, count: tires.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get tire statistics
export const getTireStatistics = async (req, res) => {
  try {
    const stats = await tireService.getTireStatistics();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Tire statistics retrieved successfully",
      stats
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
