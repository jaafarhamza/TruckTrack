import * as statisticsService from "../services/statisticsService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await statisticsService.getDashboardSummary();
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Dashboard summary retrieved successfully",
      summary
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get fleet overview
export const getFleetOverview = async (req, res) => {
  try {
    const overview = await statisticsService.getFleetOverview();
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fleet overview retrieved successfully",
      overview
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get trip statistics
export const getTripStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await statisticsService.getTripStatistics(startDate, endDate);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trip statistics retrieved successfully",
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

// Get fuel statistics
export const getFuelStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await statisticsService.getFuelStatistics(startDate, endDate);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fuel statistics retrieved successfully",
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

// Get maintenance statistics
export const getMaintenanceStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await statisticsService.getMaintenanceStatistics(
      startDate,
      endDate
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance statistics retrieved successfully",
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

// Get driver statistics
export const getDriverStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await statisticsService.getDriverStatistics(
      startDate,
      endDate
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Driver statistics retrieved successfully",
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

// Get financial summary
export const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await statisticsService.getFinancialSummary(
      startDate,
      endDate
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Financial summary retrieved successfully",
      summary
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
