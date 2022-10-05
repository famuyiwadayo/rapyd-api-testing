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
router.post("/approve/:id", authGuard, controller.approveApplication);
router.post("/decline/:id", authGuard, controller.declineApplication);
router.post("/reapply/:id", authGuard, controller.reapplyForApplication);

router.get("/", authGuard, controller.getAllApplications);
router.get("/me", authGuard, controller.getCurrentDriverOnboardingInfo);
router.get("/status", authGuard, controller.getApplicationStatus);
router.get("/:id", authGuard, controller.getApplicationById);

export default router;
