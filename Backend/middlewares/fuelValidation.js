import { body, param, query } from "express-validator";
import { FUEL_TYPE, VEHICLE_TYPE } from "../utils/constants.js";

export const createFuelValidation = [
  body("vehicle")
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isMongoId()
    .withMessage("Invalid vehicle ID"),

  body("vehicleModel")
    .notEmpty()
    .withMessage("Vehicle model is required")
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle model must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),

  body("trip").optional().isMongoId().withMessage("Invalid trip ID"),

  body("date").optional().isISO8601().withMessage("Date must be a valid date"),

  body("volume")
    .notEmpty()
    .withMessage("Fuel volume is required")
    .isFloat({ min: 1, max: 2000 })
    .withMessage("Volume must be between 1 and 2000 liters"),

  body("unitCost")
    .notEmpty()
    .withMessage("Unit cost is required")
    .isFloat({ min: 0.1, max: 10 })
    .withMessage("Unit cost must be between 0.1 and 10"),

  body("totalCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total cost must be a positive number"),

  body("currentKm")
    .notEmpty()
    .withMessage("Current kilometer reading is required")
    .isInt({ min: 0 })
    .withMessage("Current km must be a positive number"),

  body("station")
    .trim()
    .notEmpty()
    .withMessage("Fuel station is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Station name must be between 2 and 100 characters"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  body("invoice")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Invoice number cannot exceed 50 characters"),

  body("fuelType")
    .notEmpty()
    .withMessage("Fuel type is required")
    .isIn(Object.values(FUEL_TYPE))
    .withMessage(
      `Fuel type must be one of: ${Object.values(FUEL_TYPE).join(", ")}`
    ),
];

export const updateFuelValidation = [
  param("id").isMongoId().withMessage("Invalid fuel record ID"),

  body("trip").optional().isMongoId().withMessage("Invalid trip ID"),

  body("date").optional().isISO8601().withMessage("Date must be a valid date"),

  body("volume")
    .optional()
    .isFloat({ min: 1, max: 2000 })
    .withMessage("Volume must be between 1 and 2000 liters"),

  body("unitCost")
    .optional()
    .isFloat({ min: 0.1, max: 10 })
    .withMessage("Unit cost must be between 0.1 and 10"),

  body("totalCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total cost must be a positive number"),

  body("currentKm")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Current km must be a positive number"),

  body("station")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Station name must be between 2 and 100 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  body("invoice")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Invoice number cannot exceed 50 characters"),

  body("fuelType")
    .optional()
    .isIn(Object.values(FUEL_TYPE))
    .withMessage(
      `Fuel type must be one of: ${Object.values(FUEL_TYPE).join(", ")}`
    ),
];

export const fuelIdValidation = [
  param("id").isMongoId().withMessage("Invalid fuel record ID"),
];

export const vehicleIdValidation = [
  param("vehicleId").isMongoId().withMessage("Invalid vehicle ID"),
  query("vehicleModel")
    .notEmpty()
    .withMessage("Vehicle model is required")
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle model must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),
];

export const getFuelValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("vehicle").optional().isMongoId().withMessage("Invalid vehicle ID"),

  query("vehicleModel")
    .optional()
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle model must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),

  query("trip").optional().isMongoId().withMessage("Invalid trip ID"),

  query("fuelType")
    .optional()
    .isIn(Object.values(FUEL_TYPE))
    .withMessage(
      `Fuel type must be one of: ${Object.values(FUEL_TYPE).join(", ")}`
    ),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
];

export const getStatisticsValidation = [
  query("vehicle").optional().isMongoId().withMessage("Invalid vehicle ID"),

  query("vehicleModel")
    .optional()
    .isIn(Object.values(VEHICLE_TYPE))
    .withMessage(
      `Vehicle model must be one of: ${Object.values(VEHICLE_TYPE).join(", ")}`
    ),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
];
