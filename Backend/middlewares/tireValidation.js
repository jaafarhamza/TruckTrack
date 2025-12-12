import { body, param, query } from "express-validator";
import {
  TIRE_STATUS,
  TIRE_POSITION,
  VEHICLE_TYPE,
} from "../utils/constants.js";

// Validation rules
export const createTireValidation = [
  body("reference")
    .trim()
    .notEmpty()
    .withMessage("Tire reference is required")
    .toUpperCase(),

  body("vehicle")
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isMongoId()
    .withMessage("Invalid vehicle ID"),

  body("vehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required")
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle type must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),

  body("position")
    .notEmpty()
    .withMessage("Tire position is required")
    .isIn(Object.values(TIRE_POSITION))
    .withMessage(
      `Position must be one of: ${Object.values(TIRE_POSITION).join(", ")}`
    ),

  body("installationDate")
    .notEmpty()
    .withMessage("Installation date is required")
    .isISO8601()
    .withMessage("Installation date must be a valid date"),

  body("installationKm")
    .notEmpty()
    .withMessage("Installation mileage is required")
    .isInt({ min: 0 })
    .withMessage("Installation mileage must be a positive number"),

  body("currentKm")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Current mileage must be a positive number"),

  body("status")
    .optional()
    .isIn(Object.values(TIRE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(TIRE_STATUS).join(", ")}`
    ),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Tire brand is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),

  body("model")
    .trim()
    .notEmpty()
    .withMessage("Tire model is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Model must be between 1 and 50 characters"),

  body("dimension")
    .trim()
    .notEmpty()
    .withMessage("Tire dimension is required")
    .matches(/^[0-9]+\/[0-9]+R[0-9]+(\.[0-9]+)?$/)
    .withMessage("Dimension must be in format like 315/80R22.5"),

  body("pressure")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Pressure must be between 0 and 200 PSI"),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),
];

// Validation rules for updating a tire
export const updateTireValidation = [
  param("id").isMongoId().withMessage("Invalid tire ID"),

  body("reference").optional().trim().toUpperCase(),

  body("position")
    .optional()
    .isIn(Object.values(TIRE_POSITION))
    .withMessage(
      `Position must be one of: ${Object.values(TIRE_POSITION).join(", ")}`
    ),

  body("installationDate")
    .optional()
    .isISO8601()
    .withMessage("Installation date must be a valid date"),

  body("installationKm")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Installation mileage must be a positive number"),

  body("currentKm")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Current mileage must be a positive number"),

  body("status")
    .optional()
    .isIn(Object.values(TIRE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(TIRE_STATUS).join(", ")}`
    ),

  body("brand")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),

  body("model")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Model must be between 1 and 50 characters"),

  body("dimension")
    .optional()
    .trim()
    .matches(/^[0-9]+\/[0-9]+R[0-9]+(\.[0-9]+)?$/)
    .withMessage("Dimension must be in format like 315/80R22.5"),

  body("pressure")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Pressure must be between 0 and 200 PSI"),

  body("purchasePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),
];

// Validation for tire ID parameter
export const tireIdValidation = [
  param("id").isMongoId().withMessage("Invalid tire ID"),
];

// Validation for vehicle ID parameter
export const vehicleIdValidation = [
  param("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),
  query("vehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required")
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle type must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),
];

// Validation for pagination and filtering
export const getTiresValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(Object.values(TIRE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(TIRE_STATUS).join(", ")}`
    ),

  query("vehicleType")
    .optional()
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle type must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),

  query("position")
    .optional()
    .isIn(Object.values(TIRE_POSITION))
    .withMessage(
      `Position must be one of: ${Object.values(TIRE_POSITION).join(", ")}`
    ),

  query("sortBy")
    .optional()
    .isIn([
      "reference",
      "brand",
      "model",
      "status",
      "installationDate",
      "currentKm",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

// Validation for updating mileage
export const updateMileageValidation = [
  param("id").isMongoId().withMessage("Invalid tire ID"),

  body("currentKm")
    .notEmpty()
    .withMessage("Current mileage is required")
    .isInt({ min: 0 })
    .withMessage("Current mileage must be a positive number"),
];
