import { body, param, query } from "express-validator";
import { VEHICLE_STATUS, TRAILER_TYPES } from "../utils/constants.js";

// Validation rules for creating a trailer
export const createTrailerValidation = [
  body("plateNumber")
    .trim()
    .notEmpty()
    .withMessage("Plate number is required")
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage("Plate number can only contain letters, numbers, and hyphens")
    .toUpperCase(),

  body("type")
    .notEmpty()
    .withMessage("Trailer type is required")
    .isIn(Object.values(TRAILER_TYPES))
    .withMessage(
      `Trailer type must be one of: ${Object.values(TRAILER_TYPES).join(", ")}`
    ),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Brand must be between 2 and 50 characters"),

  body("model")
    .trim()
    .notEmpty()
    .withMessage("Model is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Model must be between 1 and 50 characters"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Year must be between 1900 and ${new Date().getFullYear() + 1}`
    ),

  body("status")
    .optional()
    .isIn(Object.values(VEHICLE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(VEHICLE_STATUS).join(", ")}`
    ),

  body("loadCapacity")
    .notEmpty()
    .withMessage("Load capacity is required")
    .isFloat({ min: 0 })
    .withMessage("Load capacity must be a positive number"),

  body("length")
    .notEmpty()
    .withMessage("Length is required")
    .isFloat({ gt: 0 })
    .withMessage("Length must be a positive number"),

  body("width")
    .notEmpty()
    .withMessage("Width is required")
    .isFloat({ gt: 0 })
    .withMessage("Width must be a positive number"),

  body("height")
    .notEmpty()
    .withMessage("Height is required")
    .isFloat({ gt: 0 })
    .withMessage("Height must be a positive number"),

  body("purchaseDate")
    .notEmpty()
    .withMessage("Purchase date is required")
    .isISO8601()
    .withMessage("Purchase date must be a valid date"),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color cannot exceed 30 characters"),

  body("serialNumber")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ min: 1 })
    .withMessage("Serial number must not be empty if provided"),

  body("axles")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Axles must be between 1 and 5"),

  body("tareWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tare weight must be a positive number"),
];

// Validation rules for updating a trailer
export const updateTrailerValidation = [
  param("id").isMongoId().withMessage("Invalid trailer ID"),

  body("plateNumber")
    .optional()
    .trim()
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage("Plate number can only contain letters, numbers, and hyphens")
    .toUpperCase(),

  body("type")
    .optional()
    .isIn(Object.values(TRAILER_TYPES))
    .withMessage(
      `Trailer type must be one of: ${Object.values(TRAILER_TYPES).join(", ")}`
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

  body("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Year must be between 1900 and ${new Date().getFullYear() + 1}`
    ),

  body("status")
    .optional()
    .isIn(Object.values(VEHICLE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(VEHICLE_STATUS).join(", ")}`
    ),

  body("loadCapacity")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Load capacity must be a positive number"),

  body("length")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Length must be a positive number"),

  body("width")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Width must be a positive number"),

  body("height")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Height must be a positive number"),

  body("purchaseDate")
    .optional()
    .isISO8601()
    .withMessage("Purchase date must be a valid date"),

  body("purchasePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color cannot exceed 30 characters"),

  body("serialNumber")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ min: 1 })
    .withMessage("Serial number must not be empty if provided"),

  body("axles")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Axles must be between 1 and 5"),

  body("tareWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tare weight must be a positive number"),
];

// Validation for trailer ID parameter
export const trailerIdValidation = [
  param("id").isMongoId().withMessage("Invalid trailer ID"),
];

// Validation for pagination and filtering
export const getTrailersValidation = [
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
    .isIn(Object.values(VEHICLE_STATUS))
    .withMessage(
      `Status must be one of: ${Object.values(VEHICLE_STATUS).join(", ")}`
    ),

  query("type")
    .optional()
    .isIn(Object.values(TRAILER_TYPES))
    .withMessage(
      `Type must be one of: ${Object.values(TRAILER_TYPES).join(", ")}`
    ),

  query("sortBy")
    .optional()
    .isIn([
      "plateNumber",
      "type",
      "brand",
      "model",
      "year",
      "status",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];
