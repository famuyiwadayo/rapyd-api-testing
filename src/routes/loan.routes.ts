import { Router } from "express";
import { authGuard } from "../middlewares";
import { LoanController } from "../controllers";

const router = Router();
const controller = new LoanController();

router.post("/request", authGuard, controller.requestLoan);

router.put("/:id/approve", authGuard, controller.approveLoan);
router.put("/:id/decline", authGuard, controller.declineLoan);

router.get("/", authGuard, controller.getLoans);
router.get("/eligibility", authGuard, controller.checkEligibility);
router.get("/:id", authGuard, controller.getLoansById);

export default router;
