import { Router } from "express";
import { authGuard } from "../middlewares";
import { CarController } from "../controllers";

const router = Router();
const controller = new CarController();

router.post("/", authGuard, controller.createCar);
router.post("/colors", authGuard, controller.createCarColor);
router.post("/features", authGuard, controller.createCarFeature);

router.put("/:id", authGuard, controller.updateCar);
router.put("/colors/:slug", authGuard, controller.updateCarColor);
router.put("/features/:slug", authGuard, controller.updateCarFeature);

router.get("/", authGuard, controller.getCars);
router.get("/colors", authGuard, controller.getCarColors);
router.get("/features", authGuard, controller.getCarFeatures);
router.get("/:id", authGuard, controller.getCarById);
router.get("/:id/similar", authGuard, controller.getSimilarCars);

router.delete("/:id", authGuard, controller.deleteCar);
router.delete("/colors/:id", authGuard, controller.deleteCarColor);
router.delete("/features/:id", authGuard, controller.deleteCarFeature);

export default router;
