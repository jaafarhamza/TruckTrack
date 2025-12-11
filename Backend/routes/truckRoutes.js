import express from "express";
import {
  createTruck,
  getAllTrucks,
  getTruckById,
  updateTruck,
  deleteTruck,
  getAvailableTrucks,
  updateTruckMileage,
} from "../controllers/truckController.js";
import {
  createTruckValidation,
  updateTruckValidation,
  truckIdValidation,
  getTrucksValidation,
  updateMileageValidation,
} from "../middlewares/truckValidation.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public routes (authenticated users)
router.get("/", getTrucksValidation, validate, getAllTrucks);
router.get("/available", getAvailableTrucks);
router.get("/:id", truckIdValidation, validate, getTruckById);

// Admin-only routes
router.post("/", isAdmin, createTruckValidation, validate, createTruck);
router.put("/:id", isAdmin, updateTruckValidation, validate, updateTruck);
router.delete("/:id", isAdmin, truckIdValidation, validate, deleteTruck);
router.patch(
  "/:id/mileage",
  isAdmin,
  updateMileageValidation,
  validate,
  updateTruckMileage
);

export default router;
