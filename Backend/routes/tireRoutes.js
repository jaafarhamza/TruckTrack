import express from "express";
import {
  createTire,
  getAllTires,
  getTireById,
  updateTire,
  deleteTire,
  getTiresByVehicle,
  updateTireKm,
  getTiresNeedingReplacement,
  getTireStatistics,
} from "../controllers/tireController.js";
import {
  createTireValidation,
  updateTireValidation,
  tireIdValidation,
  vehicleIdValidation,
  getTiresValidation,
  updateMileageValidation,
} from "../middlewares/tireValidation.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public routes (authenticated users)
router.get("/", getTiresValidation, validate, getAllTires);
router.get("/statistics", getTireStatistics);
router.get("/alerts/replacement", getTiresNeedingReplacement);
router.get(
  "/vehicle/:vehicleId",
  vehicleIdValidation,
  validate,
  getTiresByVehicle
);
router.get("/:id", tireIdValidation, validate, getTireById);

// Admin-only routes
router.post("/", isAdmin, createTireValidation, validate, createTire);
router.put("/:id", isAdmin, updateTireValidation, validate, updateTire);
router.delete("/:id", isAdmin, tireIdValidation, validate, deleteTire);
router.patch(
  "/:id/mileage",
  isAdmin,
  updateMileageValidation,
  validate,
  updateTireKm
);

export default router;
