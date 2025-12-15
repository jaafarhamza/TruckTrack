import { body, param, query } from "express-validator";

export const getDriversValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("active")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Active must be 'true' or 'false'"),

  query("sortBy")
    .optional()
    .isIn([
      "username",
      "firstName",
      "lastName",
      "email",
      "hireDate",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const driverIdValidation = [
  param("id").isMongoId().withMessage("Invalid driver ID"),
];

export const createDriverValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Phone cannot exceed 20 characters"),

  body("license")
    .trim()
    .notEmpty()
    .withMessage("License is required for drivers")
    .isLength({ min: 2, max: 50 })
    .withMessage("License must be between 2 and 50 characters"),
];

export const updateDriverValidation = [
  param("id").isMongoId().withMessage("Invalid driver ID"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Phone cannot exceed 20 characters"),

  body("license")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("License must be between 2 and 50 characters"),

  body("active").optional().isBoolean().withMessage("Active must be a boolean"),

  body("hireDate")
    .optional()
    .isISO8601()
    .withMessage("Hire date must be a valid date"),
];
