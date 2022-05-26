import { Router } from "express";
import { authGuard } from "../middlewares";
import { ServicingController } from "../controllers";

const router = Router();
const controller = new ServicingController();

router.post("/", authGuard, controller.createServicing);

router.put("/:id/comment", authGuard, controller.updateServicingComment);

router.get("/", authGuard, controller.getAllServicing);
router.get("/me", authGuard, controller.getAllCurrentUserServicing);

router.delete("/:id", authGuard, controller.deleteServicing);

export default router;
