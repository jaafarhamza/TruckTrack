import { body, param, query } from "express-validator";
import { TRIP_STATUS } from "../utils/constants.js";

// Validation for getting trips
export const getTripsValidation = [
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
    .isIn(Object.values(TRIP_STATUS))
    .withMessage("Invalid trip status"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
];

// Validation for trip ID param
export const tripIdValidation = [
  param("id").isMongoId().withMessage("Invalid trip ID"),
];

// Address validation helper
const addressValidation = (field) => [
  body(`${field}.city`)
    .notEmpty()
    .withMessage(`${field} city is required`)
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${field} city cannot exceed 100 characters`),
  body(`${field}.country`)
    .notEmpty()
    .withMessage(`${field} country is required`)
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${field} country cannot exceed 100 characters`),
  body(`${field}.street`)
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage(`${field} street cannot exceed 200 characters`),
  body(`${field}.postalCode`)
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage(`${field} postal code cannot exceed 20 characters`),
];

// Validation for creating a trip
export const createTripValidation = [
  body("driver")
    .notEmpty()
    .withMessage("Driver is required")
    .isMongoId()
    .withMessage("Invalid driver ID"),
  body("truck")
    .notEmpty()
    .withMessage("Truck is required")
    .isMongoId()
    .withMessage("Invalid truck ID"),
  body("trailer").optional().isMongoId().withMessage("Invalid trailer ID"),
  ...addressValidation("origin"),
  ...addressValidation("destination"),
  body("departureDate")
    .notEmpty()
    .withMessage("Departure date is required")
    .isISO8601()
    .withMessage("Departure date must be a valid date"),
  body("arrivalDate")
    .notEmpty()
    .withMessage("Arrival date is required")
    .isISO8601()
    .withMessage("Arrival date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departureDate)) {
        throw new Error("Arrival date must be after departure date");
      }
      return true;
    }),
  body("cargo")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cargo description cannot exceed 500 characters"),
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Remarks cannot exceed 1000 characters"),
];

// Validation for updating a trip
export const updateTripValidation = [
  ...tripIdValidation,
  body("driver").optional().isMongoId().withMessage("Invalid driver ID"),
  body("truck").optional().isMongoId().withMessage("Invalid truck ID"),
  body("trailer").optional().isMongoId().withMessage("Invalid trailer ID"),
  body("origin.city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Origin city cannot exceed 100 characters"),
  body("origin.country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Origin country cannot exceed 100 characters"),
  body("destination.city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Destination city cannot exceed 100 characters"),
  body("destination.country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Destination country cannot exceed 100 characters"),
  body("departureDate")
    .optional()
    .isISO8601()
    .withMessage("Departure date must be a valid date"),
  body("arrivalDate")
    .optional()
    .isISO8601()
    .withMessage("Arrival date must be a valid date"),
  body("cargo")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cargo description cannot exceed 500 characters"),
  body("weight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Remarks cannot exceed 1000 characters"),
];

// Validation for starting a trip
export const startTripValidation = [
  ...tripIdValidation,
  body("startKm")
    .notEmpty()
    .withMessage("Start km is required")
    .isInt({ min: 0 })
    .withMessage("Start km must be a non-negative integer"),
];

// Validation for completing a trip
export const completeTripValidation = [
  ...tripIdValidation,
  body("endKm")
    .notEmpty()
    .withMessage("End km is required")
    .isInt({ min: 0 })
    .withMessage("End km must be a non-negative integer"),
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Remarks cannot exceed 1000 characters"),
];

// Validation for cancelling a trip
export const cancelTripValidation = [
  ...tripIdValidation,
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cancellation reason cannot exceed 500 characters"),
];

// Validation for updating fuel
export const updateFuelValidation = [
  ...tripIdValidation,
  body("volume")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Volume must be a non-negative number"),
  body("cost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost must be a non-negative number"),
];
