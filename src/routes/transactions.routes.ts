import { Router } from "express";
import { authGuard } from "../middlewares";
import { TransactionController } from "../controllers";

const router = Router();
const controller = new TransactionController();

router.get("/", authGuard, controller.getTransactions);
router.get("/:ref", authGuard, controller.getTransaction);

export default router;
