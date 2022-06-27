import { Router } from "express";
import { authGuard } from "../middlewares";
import { PaymentController } from "../controllers";

const router = Router();
const controller = new PaymentController();

router.post("/initialize", authGuard, controller.initialize);
router.post("/items", authGuard, controller.addPaymentItem);

router.put("/approve", authGuard, controller.approveBankTransfer);
router.put("/items/:itemId", authGuard, controller.updatePaymentItem);

router.get("/items", authGuard, controller.getPaymentItems);
router.get("/:ref/status", authGuard, controller.checkStatus);
router.get("/items/:itemId", authGuard, controller.getPaymentItem);

router.delete("/items/:itemId", authGuard, controller.deletePaymentItem);

export default router;
