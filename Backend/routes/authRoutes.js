import express from "express";
import { register, login, getProfil } from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
} from "../middlewares/validation.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

// Protected routes
router.get("/profil", protect, getProfil);

export default router;
