import express from "express";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import { validate } from "../middlewares/validate.js";
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
router.get("/my-trips/stats", tripController.getMyTripStats);
router.get("/my-trips/:id/pdf", tripController.downloadMyTripPDF);
router.get("/my-trips/:id", tripController.getMyTripById);
router.get("/my-trips", tripController.getMyTrips);
router.patch("/my-trips/:id/start", tripController.startMyTrip);
router.patch("/my-trips/:id/complete", tripController.completeMyTrip);

// Admin routes
router.get("/driver/:driverId", isAdmin, tripController.getDriverTrips);
router.get("/stats", isAdmin, tripController.getTripStats);
router.get(
  "/",
  isAdmin,
  getTripsValidation,
  validate,
  tripController.getAllTrips
);
router.get(
  "/:id",
  isAdmin,
  tripIdValidation,
  validate,
  tripController.getTripById
);
router.post(
  "/",
  isAdmin,
  createTripValidation,
  validate,
  tripController.createTrip
);
router.put(
  "/:id",
  isAdmin,
  updateTripValidation,
  validate,
  tripController.updateTrip
);
router.delete(
  "/:id",
  isAdmin,
  tripIdValidation,
  validate,
  tripController.deleteTrip
);

// Status transition routes
router.patch(
  "/:id/start",
  isAdmin,
  startTripValidation,
  validate,
  tripController.startTrip
);
router.patch(
  "/:id/complete",
  isAdmin,
  completeTripValidation,
  validate,
  tripController.completeTrip
);
router.patch(
  "/:id/cancel",
  isAdmin,
  cancelTripValidation,
  validate,
  tripController.cancelTrip
);

// Fuel update route
router.patch(
  "/:id/fuel",
  isAdmin,
  updateFuelValidation,
  validate,
  tripController.updateTripFuel
);

export default router;
