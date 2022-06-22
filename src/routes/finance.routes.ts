import { Router } from "express";
import { authGuard } from "../middlewares";
import { FinanceController } from "../controllers";

const router = Router();
const controller = new FinanceController();

router.get("/:id", authGuard, controller.getFinanceById);

router.get("/:financeId/spreads/:accountId", authGuard, controller.getSpreads);

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

router.get(
  "/vehicles/:vehicleId/me",
  authGuard,
  controller.getCurrentUserVehicleFinance
);

router.get("/drivers/:accountId", authGuard, controller.getVehicleFinance);

router.get(
  "/vehicles/:vehicleId/spreads",
  authGuard,
  controller.getCurrentUserSpreads
);

export default router;
