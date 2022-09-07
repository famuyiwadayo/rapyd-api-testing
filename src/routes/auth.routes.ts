import { Router } from "express";
import { authGuard, deviceGuard } from "../middlewares";
import { AuthController } from "../controllers";

const router = Router();
const controller = new AuthController();

router.post("/register", deviceGuard, controller.register);
router.post("/login", deviceGuard, controller.login);
router.post("/login/admin", deviceGuard, controller.adminLogin);
router.post("/reset", deviceGuard, controller.resetPassword);

router.post("/verify/email", authGuard, controller.verifyEmail);

router.post("/register/driver", deviceGuard, controller.registerDriverAccount);
// router.post("/register/premium", controller.registerPremiumAccount);

router.post("/request/reset", deviceGuard, controller.requestResetPasswordToken);
router.get("/request/email", authGuard, controller.requestEmailVerification);

export default router;
