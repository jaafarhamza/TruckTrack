import { body, param, query } from "express-validator";
import { MAINTENANCE_TYPE } from "../utils/constants.js";

// Validation for creating a maintenance rule
export const createRuleValidation = [
  body("type")
    .notEmpty()
    .withMessage("Maintenance type is required")
    .isIn(Object.values(MAINTENANCE_TYPE))
    .withMessage(
      `Invalid maintenance type. Must be one of: ${Object.values(
        MAINTENANCE_TYPE
      ).join(", ")}`
    ),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("kmInterval")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Km interval must be a positive number"),
  body("monthInterval")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Month interval must be between 1 and 60"),
  body("estimatedCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated cost must be a positive number"),
  body("active").optional().isBoolean().withMessage("Active must be a boolean"),
];

// Validation for updating a maintenance rule
export const updateRuleValidation = [
  param("id").isMongoId().withMessage("Invalid rule ID"),
  body("type")
    .optional()
    .isIn(Object.values(MAINTENANCE_TYPE))
    .withMessage(
      `Invalid maintenance type. Must be one of: ${Object.values(
        MAINTENANCE_TYPE
      ).join(", ")}`
    ),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("kmInterval")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Km interval must be a positive number"),
  body("monthInterval")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Month interval must be between 1 and 60"),
  body("estimatedCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated cost must be a positive number"),
  body("active").optional().isBoolean().withMessage("Active must be a boolean"),
];

// Validation for rule ID parameter
export const ruleIdValidation = [
  param("id").isMongoId().withMessage("Invalid rule ID"),
];

// Validation for query parameters
export const getRulesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("type")
    .optional()
    .isIn(Object.values(MAINTENANCE_TYPE))
    .withMessage(
      `Invalid maintenance type. Must be one of: ${Object.values(
        MAINTENANCE_TYPE
      ).join(", ")}`
    ),
  query("active")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Active must be true or false"),
];
