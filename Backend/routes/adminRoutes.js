import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();

router.use(protect, isAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/activate", activateUser);
router.delete("/users/:id", deleteUser);

export default router;
