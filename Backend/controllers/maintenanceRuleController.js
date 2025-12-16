import * as maintenanceRuleService from "../services/maintenanceRuleService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all maintenance rules
export const getAllRules = async (req, res) => {
  try {
    const result = await maintenanceRuleService.getAllRules(req.query);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance rules retrieved successfully",
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

// Get rule by ID
export const getRuleById = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.getRuleById(req.params.id);
    return successResponse(res, HTTP_STATUS.OK, "Rule retrieved successfully", {
      rule,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Create maintenance rule
export const createRule = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.createRule(req.body);
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Maintenance rule created successfully",
      { rule }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update maintenance rule
export const updateRule = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.updateRule(
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance rule updated successfully",
      { rule }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Delete maintenance rule
export const deleteRule = async (req, res) => {
  try {
    await maintenanceRuleService.deleteRule(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance rule deleted successfully",
      null
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Toggle active status
export const toggleActive = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.toggleActive(req.params.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      `Maintenance rule ${
        rule.active ? "activated" : "deactivated"
      } successfully`,
      { rule }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get rule statistics
export const getRuleStats = async (req, res) => {
  try {
    const stats = await maintenanceRuleService.getRuleStats();
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Maintenance rule stats retrieved successfully",
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
