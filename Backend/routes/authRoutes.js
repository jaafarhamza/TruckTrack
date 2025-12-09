import express from "express";
import { register, login, getProfil } from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

//Protected routes
router.get("/profil", getProfil);

export default router;
