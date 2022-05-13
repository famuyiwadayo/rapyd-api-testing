import { Router } from "express";
import { authGuard } from "../middlewares";
import { OnboardingController } from "../controllers";

const router = Router();
const controller = new OnboardingController();

router.put("/vehicle/:vehicleId", authGuard, controller.selectVehicle);
router.put("/biodata", authGuard, controller.createBiodata);
router.put("/documents", authGuard, controller.createDocuments);
router.put("/hirePurchase", authGuard, controller.hirePurchaseContract);

router.post("/payment", authGuard, controller.makePayment);
router.post("/guarantors", authGuard, controller.addGuarantors);

router.get("/", authGuard, controller.getDriverOnboardingInfo);
router.get("/status", authGuard, controller.getApplicationStatus);

export default router;
