import { Router } from "express";
import { authGuard } from "../middlewares";
import { FinanceController } from "../controllers";

const router = Router();
const controller = new FinanceController();

router.post(
  "/vehicles/:vehicleId/deposit",
  authGuard,
  controller.makeInitialVehicleDeposit
);

router.post(
  "/vehicles/:vehicleId/instalment",
  authGuard,
  controller.getPeriodicVehicleInstalment
);

router.get(
  "/vehicles/:vehicleId/analysis",
  authGuard,
  controller.getCurrentUserVehicleFinanceAnalysis
);

router.get("/vehicles/:vehicleId/spreads", authGuard, controller.getSpreads);

export default router;
