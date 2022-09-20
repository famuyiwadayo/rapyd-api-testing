import { Router } from "express";
import { authGuard } from "../middlewares";
import { AdminCommentController } from "../controllers";

const router = Router();
const controller = new AdminCommentController();

// router.post("/waitlist", controller.addToWaitlist);
router.get("/", authGuard, controller.getAll);
router.get("/:id", authGuard, controller.getById);

router.post("/", authGuard, controller.create);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.delete);

export default router;
