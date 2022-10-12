import { Router } from "express";
import { authGuard, deviceGuard } from "../middlewares";
import { GuarantorController } from "../controllers";

const router = Router();
const controller = new GuarantorController();

router.get("/", authGuard, controller.getGuarantors);
router.get("/me", authGuard, controller.getCurrentUserGuarantors);
router.get("/:id", authGuard, controller.getGuarantorById);

router.post("/", authGuard, controller.addGuarantor);
router.delete("/:id", authGuard, controller.deleteGuarantor);

// TODO: test these newly added 2 Oct 2022 apis
router.put("/:id/verify", authGuard, controller.verifyGuarantor);
router.put("/:id/decline", authGuard, controller.rejectGuarantor);
router.put("/:token/update", deviceGuard, controller.updateGuarantorWithToken);
router.put("/:token/validate", deviceGuard, controller.validateGuarantorFormToken);

export default router;
