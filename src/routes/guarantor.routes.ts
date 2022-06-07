import { Router } from "express";
import { authGuard } from "../middlewares";
import { GuarantorController } from "../controllers";

const router = Router();
const controller = new GuarantorController();

router.get("/me", authGuard, controller.getCurrentUserGuarantors);
router.get("/:account", authGuard, controller.getGuarantors);

router.post("/", authGuard, controller.addGuarantor);

router.delete("/:id", authGuard, controller.deleteGuarantor);

export default router;
