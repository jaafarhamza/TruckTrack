import express from "express";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import * as maintenanceAlertController from "../controllers/maintenanceAlertController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Get all maintenance alerts
router.get("/", maintenanceAlertController.getAllAlerts);

// Get upcoming maintenance
router.get("/upcoming", maintenanceAlertController.getUpcoming);

// Get vehicle maintenance status
router.get(
  "/vehicle/:vehicleType/:vehicleId",
  maintenanceAlertController.getVehicleStatus
);

export default router;
