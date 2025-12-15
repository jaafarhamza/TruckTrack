import { param, query } from "express-validator";

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
