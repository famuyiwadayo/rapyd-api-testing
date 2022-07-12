import { Router } from "express";
import { authGuard } from "../middlewares";
import { NotificationController } from "../controllers";

const router = Router();
const controller = new NotificationController();

// router.post("/waitlist", controller.addToWaitlist);
router.get("/", authGuard, controller.getAdminNotifications);
router.get("/me", authGuard, controller.getNotifications);

export default router;
