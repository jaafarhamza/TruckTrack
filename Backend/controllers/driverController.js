import * as driverService from "../services/driverService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";


export const getAllDrivers = async (req, res) => {
  try {
    const { page, limit, search, active, sortBy, sortOrder } = req.query;

    const result = await driverService.getAllDrivers({
      page,
      limit,
      search,
      active,
      sortBy,
      sortOrder,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Drivers retrieved successfully",
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

export const getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Driver retrieved successfully",
      { driver }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getActiveDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getActiveDrivers();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Active drivers retrieved successfully",
      { drivers, count: drivers.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getDriverStats = async (req, res) => {
  try {
    const stats = await driverService.getDriverStats();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Driver statistics retrieved successfully",
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
