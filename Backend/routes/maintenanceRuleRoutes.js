import express from "express";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import { validate } from "../middlewares/validate.js";
import * as maintenanceRuleController from "../controllers/maintenanceRuleController.js";
import {
  createRuleValidation,
  updateRuleValidation,
  ruleIdValidation,
  getRulesValidation,
} from "../middlewares/maintenanceRuleValidation.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Get rule statistics (before /:id to avoid conflict)
router.get("/stats", maintenanceRuleController.getRuleStats);

// Get all maintenance rules
router.get(
  "/",
  getRulesValidation,
  validate,
  maintenanceRuleController.getAllRules
);

// Get rule by ID
router.get(
  "/:id",
  ruleIdValidation,
  validate,
  maintenanceRuleController.getRuleById
);

// Create maintenance rule
router.post(
  "/",
  createRuleValidation,
  validate,
  maintenanceRuleController.createRule
);

// Update maintenance rule
router.put(
  "/:id",
  updateRuleValidation,
  validate,
  maintenanceRuleController.updateRule
);

// Toggle active status
router.patch(
  "/:id/toggle",
  ruleIdValidation,
  validate,
  maintenanceRuleController.toggleActive
);

// Delete maintenance rule
router.delete(
  "/:id",
  ruleIdValidation,
  validate,
  maintenanceRuleController.deleteRule
);

export default router;
