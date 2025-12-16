import * as truckService from "../services/truckService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Create a new truck
export const createTruck = async (req, res) => {
  try {
    const truck = await truckService.createTruck(req.body);

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Truck created successfully",
      { truck }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get all trucks with pagination
export const getAllTrucks = async (req, res) => {
  try {
    const { page, limit, status, brand, search, sortBy, sortOrder } = req.query;

    const result = await truckService.getAllTrucks({
      page,
      limit,
      status,
      brand,
      search,
      sortBy,
      sortOrder,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trucks retrieved successfully",
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

// Get truck by ID
export const getTruckById = async (req, res) => {
  try {
    const truck = await truckService.getTruckById(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Truck retrieved successfully",
      { truck }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update truck
export const updateTruck = async (req, res) => {
  try {
    const truck = await truckService.updateTruck(req.params.id, req.body);

    return successResponse(res, HTTP_STATUS.OK, "Truck updated successfully", {
      truck,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Delete truck (soft delete)
export const deleteTruck = async (req, res) => {
  try {
    const truck = await truckService.deleteTruck(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Truck deleted successfully (set to OUT_OF_SERVICE)",
      { truck }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get available trucks
export const getAvailableTrucks = async (req, res) => {
  try {
    const trucks = await truckService.getAvailableTrucks();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Available trucks retrieved successfully",
      { trucks, count: trucks.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update truck mileage
export const updateTruckMileage = async (req, res) => {
  try {
    const { mileage } = req.body;
    const truck = await truckService.updateTruckMileage(req.params.id, mileage);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Truck mileage updated successfully",
      { truck }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
