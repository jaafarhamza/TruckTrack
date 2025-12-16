import express from "express";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import * as statisticsController from "../controllers/statisticsController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Dashboard summary
router.get("/dashboard", statisticsController.getDashboardSummary);

// Fleet overview
router.get("/fleet", statisticsController.getFleetOverview);

// Trip statistics
router.get("/trips", statisticsController.getTripStatistics);

// Fuel statistics
router.get("/fuel", statisticsController.getFuelStatistics);

// Maintenance statistics
router.get("/maintenance", statisticsController.getMaintenanceStatistics);

// Driver statistics
router.get("/drivers", statisticsController.getDriverStatistics);

// Financial summary
router.get("/financial", statisticsController.getFinancialSummary);

export default router;
