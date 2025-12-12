import express from "express";
import * as trailerController from "../controllers/trailerController.js";
import * as trailerValidation from "../middlewares/trailerValidation.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import { validate } from "../middlewares/validation.js";

const router = express.Router();

// Public routes (require authentication)
router.get(
  "/",
  protect,
  trailerValidation.getTrailersValidation,
  validate,
  trailerController.getAllTrailers
);

router.get("/available", protect, trailerController.getAvailableTrailers);

router.get(
  "/:id",
  protect,
  trailerValidation.trailerIdValidation,
  validate,
  trailerController.getTrailerById
);

// Admin-only routes
router.post(
  "/",
  protect,
  isAdmin,
  trailerValidation.createTrailerValidation,
  validate,
  trailerController.createTrailer
);

router.put(
  "/:id",
  protect,
  isAdmin,
  trailerValidation.updateTrailerValidation,
  validate,
  trailerController.updateTrailer
);

router.delete(
  "/:id",
  protect,
  isAdmin,
  trailerValidation.trailerIdValidation,
  validate,
  trailerController.deleteTrailer
);

export default router;
