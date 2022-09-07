import { Router } from "express";
import { authGuard } from "../middlewares";
import { DriverActivityController } from "../controllers";

const router = Router();
const controller = new DriverActivityController();

// router.post("/waitlist", controller.addToWaitlist);
router.get("/", authGuard, controller.getActivities);
router.get("/:id", authGuard, controller.getActivity);

export default router;
