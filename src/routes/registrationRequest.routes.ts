import { Router } from "express";
// import { authGuard } from "../middlewares";
// import { RegistrationRequestController } from "../controllers";

const router = Router();
// const controller = new RegistrationRequestController();

// router.get("/requests", authGuard, controller.getRequestedTokens);
// router.get("/:token", controller.validateRequestToken);
// router.post("/requests", authGuard, controller.makeRequest);
// router.post("/", controller.registerAccount);

// export default router;

router.get("/requests", () => {});
export default router;
