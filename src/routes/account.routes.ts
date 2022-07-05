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
router.get("/vehicle/analysis", authGuard, controller.getActiveVehicleAnalysis); // ✅
router.get("/vehicle/status", authGuard, controller.getVehicleStatusAnalysis); // ✅
router.get("/:id", authGuard, controller.accountById); // ✅

// POST
// router.post("/", authGuard, controller.createAccount); // ✅
router.post("/bank", authGuard, controller.addBank); // ✅

// PUT
router.put("/me", authGuard, controller.updateAccount); // ✅
router.put("/vehicle/:id/status", authGuard, controller.updateVehicleStatus); // ✅
router.put("/password", authGuard, controller.changePassword); // ✅
router.put("/:id/disable", authGuard, controller.disableAccount); // ✅
router.put("/:id/enable", authGuard, controller.enableAccount); // ✅
router.put("/:id/primaryRole", authGuard, controller.updatePrimaryRole); // ✅

// DELETE
router.delete("/bank", authGuard, controller.deleteBankInfo); // ✅
router.delete("/:id", authGuard, controller.deleteAccount); // ✅

export default router;
