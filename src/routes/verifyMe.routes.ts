import { Router } from "express";
import { VerifyMeController } from "../controllers";

const router = Router();
const controller = new VerifyMeController();

router.post("/nin", controller.verifyNiN);
router.post("/bvn", controller.verifyBvn);
router.post("/address", controller.verifyAddress);
router.post("/driversLicense", controller.verifyDriversLicense);

export default router;
