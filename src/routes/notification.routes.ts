import { Router } from "express";
import { authGuard } from "../middlewares";
import { NotificationController } from "../controllers";

const router = Router();
const controller = new NotificationController();


router.get("/", authGuard, controller.getAdminNotifications);
router.put("/", authGuard, controller.markAdminNotificationsAsRead);
router.get("/me", authGuard, controller.getNotifications);

router.put("/me", authGuard, controller.markAsRead);

export default router;
