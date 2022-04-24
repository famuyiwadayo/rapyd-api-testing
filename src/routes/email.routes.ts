import { Router } from "express";
import { EmailController } from "../controllers";

const router = Router();
const controller = new EmailController();

router.post("/waitlist", controller.addToWaitlist);

export default router;
