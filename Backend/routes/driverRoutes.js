import express from "express";
import {
  getAllDrivers,
  getDriverById,
  getActiveDrivers,
  getDriverStats,
} from "../controllers/driverController.js";
import {
  getDriversValidation,
  driverIdValidation,
} from "../middlewares/driverValidation.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// All driver 
router.use(isAdmin);

// Get driver statistics
router.get("/stats", getDriverStats);

// Get active drivers
router.get("/active", getActiveDrivers);

// Get all drivers with pagination and filtering
router.get("/", getDriversValidation, validate, getAllDrivers);

// Get driver by id
router.get("/:id", driverIdValidation, validate, getDriverById);

export default router;
