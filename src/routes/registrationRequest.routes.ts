import { Router } from "express";
import { authGuard, deviceGuard } from "../middlewares";
import { RegistrationRequestController } from "../controllers";

const router = Router();
const controller = new RegistrationRequestController();

router.get("/requests", authGuard, controller.getRequestedTokens);
router.get("/:token", deviceGuard, controller.validateRequestToken);
router.post("/requests", authGuard, controller.makeRequest);
router.post("/", deviceGuard, controller.registerAccount);

export default router;
