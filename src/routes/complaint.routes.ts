import { Router } from "express";
import { authGuard } from "../middlewares";
import { ComplaintController } from "../controllers";

const router = Router();
const controller = new ComplaintController();

router.get("/", authGuard, controller.getComplaints);
router.get("/:id", authGuard, controller.getComplaintById);
router.get("/:id/feedbacks", authGuard, controller.getComplaintFeedbacks);

router.post("/", authGuard, controller.createComplaint);
router.post("/:id/feedbacks", authGuard, controller.createComplaintFeedback);

router.put("/:id", authGuard, controller.updateComplaint);
router.put("/:id/feedbacks", authGuard, controller.updateComplaintFeedback);

router.delete("/:id", authGuard, controller.deleteComplaint);
router.delete("/feedbacks/:id", authGuard, controller.deleteComplaintFeedback);

export default router;
