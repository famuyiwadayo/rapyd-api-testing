import { Router } from "express";
import { AccountController } from "../controllers";
import { authGuard } from "../middlewares";

const router = Router();
const controller = new AccountController();
// const coinController = new CoinController();

// GET
router.get("/", authGuard, controller.getAccounts); // ✅
// router.get("/coins", authGuard, coinController.getCoinsByAccount); // ✅
router.get("/me", authGuard, controller.getCurrentUserAccount); // ✅
router.get("/:id", authGuard, controller.accountById); // ✅

// POST
// router.post("/", authGuard, controller.createAccount); // ✅

// PUT
router.put("/me", authGuard, controller.updateAccount); // ✅
router.put("/password", authGuard, controller.changePassword); // ✅
router.put("/:id/disable", authGuard, controller.disableAccount); // ✅
router.put("/:id/enable", authGuard, controller.enableAccount); // ✅
router.put("/:id/primaryRole", authGuard, controller.updatePrimaryRole); // ✅

// DELETE
router.delete("/:id", authGuard, controller.deleteAccount); // ✅

export default router;
