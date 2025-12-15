import express from "express";
import * as fuelController from "../controllers/fuelController.js";
import * as fuelValidation from "../middlewares/fuelValidation.js";
import { protect } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/authorization.js";
import { validate } from "../middlewares/validate.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(
    isAdmin,
    fuelValidation.createFuelValidation,
    validate,
    fuelController.createFuelRecord
  )
  .get(
    fuelValidation.getFuelValidation,
    validate,
    fuelController.getAllFuelRecords
  );

router
  .route("/:id")
  .get(
    fuelValidation.fuelIdValidation,
    validate,
    fuelController.getFuelRecordById
  )
  .put(
    isAdmin,
    fuelValidation.updateFuelValidation,
    validate,
    fuelController.updateFuelRecord
  )
  .delete(
    isAdmin,
    fuelValidation.fuelIdValidation,
    validate,
    fuelController.deleteFuelRecord
  );

router.get(
  "/vehicle/:vehicleId",
  fuelValidation.vehicleIdValidation,
  validate,
  fuelController.getFuelByVehicle
);

router.get(
  "/statistics/all",
  fuelValidation.getStatisticsValidation,
  validate,
  fuelController.getFuelStatistics
);

router.get(
  "/efficiency/:vehicleId",
  fuelValidation.vehicleIdValidation,
  validate,
  fuelController.getEfficiencyReport
);

router.get(
  "/cost-analysis/all",
  fuelValidation.getStatisticsValidation,
  validate,
  fuelController.getCostAnalysis
);

export default router;
