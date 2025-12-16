import express from "express";
import { protect, isAdmin } from "../middlewares/auth.js";
import * as tripController from "../controllers/tripController.js";
import {
  getTripsValidation,
  tripIdValidation,
  createTripValidation,
  updateTripValidation,
  startTripValidation,
  completeTripValidation,
  cancelTripValidation,
  updateFuelValidation,
} from "../middlewares/tripValidation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Driver routes
router.get("/my-trips", tripController.getMyTrips);

// Admin routes
router.get("/", isAdmin, getTripsValidation, tripController.getAllTrips);
router.get("/stats", isAdmin, tripController.getTripStats);
router.get("/:id", isAdmin, tripIdValidation, tripController.getTripById);
router.post("/", isAdmin, createTripValidation, tripController.createTrip);
router.put("/:id", isAdmin, updateTripValidation, tripController.updateTrip);
router.delete("/:id", isAdmin, tripIdValidation, tripController.deleteTrip);

// Status transition routes
router.patch(
  "/:id/start",
  isAdmin,
  startTripValidation,
  tripController.startTrip
);
router.patch(
  "/:id/complete",
  isAdmin,
  completeTripValidation,
  tripController.completeTrip
);
router.patch(
  "/:id/cancel",
  isAdmin,
  cancelTripValidation,
  tripController.cancelTrip
);

// Fuel update route
router.patch(
  "/:id/fuel",
  isAdmin,
  updateFuelValidation,
  tripController.updateTripFuel
);

export default router;
