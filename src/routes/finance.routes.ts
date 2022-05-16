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

router.get(
  "/vehicles/:vehicleId/instalment",
  authGuard,
  controller.getPeriodicVehicleInstalment
);

export default router;
