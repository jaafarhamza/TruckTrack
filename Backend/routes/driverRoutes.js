import express from "express";
import {
  getAllDrivers,
  getDriverById,
  getActiveDrivers,
  getDriverStats,
  createDriver,
  updateDriver,
  toggleDriverStatus,
} from "../controllers/driverController.js";
import {
  getDriversValidation,
  driverIdValidation,
  createDriverValidation,
  updateDriverValidation,
} from "../middlewares/driverValidation.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// All driver routes are admin-only
router.use(isAdmin);

// Get driver statistics
router.get("/stats", getDriverStats);

// Get active drivers
router.get("/active", getActiveDrivers);

// Get all drivers with pagination and filtering
router.get("/", getDriversValidation, validate, getAllDrivers);

// Create a new driver
router.post("/", createDriverValidation, validate, createDriver);

// Get driver by id
router.get("/:id", driverIdValidation, validate, getDriverById);

// Update driver
router.put("/:id", updateDriverValidation, validate, updateDriver);

// Toggle driver active status
router.patch(
  "/:id/toggle-status",
  driverIdValidation,
  validate,
  toggleDriverStatus
);

export default router;
