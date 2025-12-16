import * as maintenanceCalcService from "../services/maintenanceCalculationService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all maintenance alerts
export const getAllAlerts = async (req, res) => {
  try {
    const { vehicleType, maintenanceType, status } = req.query;
    const result = await maintenanceCalcService.getAllMaintenanceAlerts({
      vehicleType,
      maintenanceType,
      status,
    });
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance alerts retrieved successfully",
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

// Get vehicle maintenance status
export const getVehicleStatus = async (req, res) => {
  try {
    const { vehicleId, vehicleType } = req.params;
    const result = await maintenanceCalcService.getVehicleMaintenanceStatus(
      vehicleId,
      vehicleType
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Vehicle maintenance status retrieved successfully",
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

// Get upcoming maintenance
export const getUpcoming = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const result = await maintenanceCalcService.getUpcomingMaintenance(
      daysAhead
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Upcoming maintenance retrieved successfully",
      { upcoming: result, daysAhead }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
