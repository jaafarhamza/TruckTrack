import { validationResult } from "express-validator";
import * as tripService from "../services/tripService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all trips
export const getAllTrips = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const result = await tripService.getAllTrips(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trips retrieved successfully", result));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Get trip by ID
export const getTripById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const trip = await tripService.getTripById(req.params.id);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip retrieved successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Get trips by driver
export const getMyTrips = async (req, res) => {
  try {
    const result = await tripService.getTripsByDriver(req.user._id, req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trips retrieved successfully", result));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Get trip stats
export const getTripStats = async (req, res) => {
  try {
    const stats = await tripService.getTripStats();
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip stats retrieved successfully", { stats }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Create trip
export const createTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const trip = await tripService.createTrip(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse("Trip created successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Update trip
export const updateTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const trip = await tripService.updateTrip(req.params.id, req.body);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip updated successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Start trip
export const startTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const { startKm } = req.body;
    const trip = await tripService.startTrip(req.params.id, startKm);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip started successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Complete trip
export const completeTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const { endKm, remarks } = req.body;
    const trip = await tripService.completeTrip(req.params.id, endKm, remarks);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip completed successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const { reason } = req.body;
    const trip = await tripService.cancelTrip(req.params.id, reason);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip cancelled successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Update fuel for trip
export const updateTripFuel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    const { volume, cost } = req.body;
    const trip = await tripService.updateTripFuel(req.params.id, volume, cost);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip fuel updated successfully", { trip }));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};

// Delete trip
export const deleteTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(errorResponse("Validation failed", errors.array()));
    }

    await tripService.deleteTrip(req.params.id);
    return res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Trip deleted successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(errorResponse(error.message));
  }
};
