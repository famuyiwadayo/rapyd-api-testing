import { Router } from "express";
import { authGuard } from "../middlewares";
import { OnboardingController } from "../controllers";

const router = Router();
const controller = new OnboardingController();

router.put("/biodata", authGuard, controller.createBiodata);
router.put("/documents", authGuard, controller.createDocuments);

router.get("/", authGuard, controller.getDriverOnboardingInfo);

export default router;
