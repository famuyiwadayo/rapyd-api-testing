import { Router } from "express";
import { authGuard } from "../middlewares";
import { VehicleController } from "../controllers";

const router = Router();
const controller = new VehicleController();

router.post("/", authGuard, controller.createVehicle);
router.post("/colors", authGuard, controller.createVehicleColor);
router.post("/types", authGuard, controller.createVehicleType);
router.post("/features", authGuard, controller.createVehicleFeature);

router.put("/:id", authGuard, controller.updateVehicle);
router.put("/colors/:slug", authGuard, controller.updateVehicleColor);
router.put("/types/:slug", authGuard, controller.updateVehicleType);
router.put("/features/:slug", authGuard, controller.updateVehicleFeature);

router.get("/", authGuard, controller.getVehicles);
router.get("/colors", authGuard, controller.getVehicleColors);
router.get("/types", authGuard, controller.getVehicleType);
router.get("/features", authGuard, controller.getVehicleFeatures);
router.get("/:id", authGuard, controller.getVehicleById);
router.get("/:id/similar", authGuard, controller.getSimilarVehicles);

router.delete("/:id", authGuard, controller.deleteVehicle);
router.delete("/colors/:id", authGuard, controller.deleteVehicleColor);
router.delete("/types/:id", authGuard, controller.deleteVehicleType);
router.delete("/features/:id", authGuard, controller.deleteVehicleFeature);

export default router;
