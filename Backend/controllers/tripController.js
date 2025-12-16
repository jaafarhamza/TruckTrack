import * as tripService from "../services/tripService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all trips
export const getAllTrips = async (req, res) => {
  try {
    const result = await tripService.getAllTrips(req.query);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trips retrieved successfully",
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

// Get trip by ID
export const getTripById = async (req, res) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    return successResponse(res, HTTP_STATUS.OK, "Trip retrieved successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get trips by driver
export const getMyTrips = async (req, res) => {
  try {
    const result = await tripService.getTripsByDriver(req.user.id, req.query);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trips retrieved successfully",
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

// Get specific trip by ID
export const getMyTripById = async (req, res) => {
  try {
    const trip = await tripService.getDriverTripById(
      req.user.id,
      req.params.id
    );
    return successResponse(res, HTTP_STATUS.OK, "Trip retrieved successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get driver's trip stats
export const getMyTripStats = async (req, res) => {
  try {
    const stats = await tripService.getDriverTripStats(req.user.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trip stats retrieved successfully",
      { stats }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get trips by driver ID (for admin)
export const getDriverTrips = async (req, res) => {
  try {
    const result = await tripService.getTripsByDriver(
      req.params.driverId,
      req.query
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Driver trips retrieved successfully",
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

// Get trip stats
export const getTripStats = async (req, res) => {
  try {
    const stats = await tripService.getTripStats();
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trip stats retrieved successfully",
      { stats }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Create trip
export const createTrip = async (req, res) => {
  try {
    const trip = await tripService.createTrip(req.body);
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Trip created successfully",
      { trip }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update trip
export const updateTrip = async (req, res) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    return successResponse(res, HTTP_STATUS.OK, "Trip updated successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Start trip
export const startTrip = async (req, res) => {
  try {
    const { startKm } = req.body;
    const trip = await tripService.startTrip(req.params.id, startKm);
    return successResponse(res, HTTP_STATUS.OK, "Trip started successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Complete trip
export const completeTrip = async (req, res) => {
  try {
    const { endKm, remarks } = req.body;
    const trip = await tripService.completeTrip(req.params.id, endKm, remarks);
    return successResponse(res, HTTP_STATUS.OK, "Trip completed successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const { reason } = req.body;
    const trip = await tripService.cancelTrip(req.params.id, reason);
    return successResponse(res, HTTP_STATUS.OK, "Trip cancelled successfully", {
      trip,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update fuel for trip
export const updateTripFuel = async (req, res) => {
  try {
    const { volume, cost } = req.body;
    const trip = await tripService.updateTripFuel(req.params.id, volume, cost);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trip fuel updated successfully",
      { trip }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Delete trip
export const deleteTrip = async (req, res) => {
  try {
    await tripService.deleteTrip(req.params.id);
    return successResponse(res, HTTP_STATUS.OK, "Trip deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
