import * as fuelService from "../services/fuelService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const createFuelRecord = async (req, res) => {
  try {
    const fuel = await fuelService.createFuelRecord(req.body);

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Fuel record created successfully",
      { fuel }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getAllFuelRecords = async (req, res) => {
  try {
    const result = await fuelService.getAllFuelRecords(req.query);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fuel records retrieved successfully",
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

export const getFuelRecordById = async (req, res) => {
  try {
    const fuel = await fuelService.getFuelRecordById(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fuel record retrieved successfully",
      { fuel }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const updateFuelRecord = async (req, res) => {
  try {
    const fuel = await fuelService.updateFuelRecord(req.params.id, req.body);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fuel record updated successfully",
      { fuel }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const deleteFuelRecord = async (req, res) => {
  try {
    const fuel = await fuelService.deleteFuelRecord(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Fuel record deleted successfully",
      { fuel }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getFuelByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { vehicleModel } = req.query;

    const fuelRecords = await fuelService.getFuelByVehicle(
      vehicleId,
      vehicleModel
    );

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Vehicle fuel records retrieved successfully",
      { fuelRecords, count: fuelRecords.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getFuelStatistics = async (req, res) => {
  try {
    const stats = await fuelService.getFuelStatistics(req.query);

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

export const getEfficiencyReport = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { vehicleModel } = req.query;

    const report = await fuelService.getEfficiencyReport(
      vehicleId,
      vehicleModel
    );

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Efficiency report retrieved successfully",
      report
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getCostAnalysis = async (req, res) => {
  try {
    const analysis = await fuelService.getCostAnalysis(req.query);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Cost analysis retrieved successfully",
      analysis
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
