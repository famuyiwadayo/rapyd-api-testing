import { NextFunction, Request, Response } from "express";
import { CarService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new CarService();

export default class CarController {
  async getCarById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getCarById(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getSimilarCars(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getSimilarCars(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCars(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getCars(roles, req.query as any);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCarColors(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getCarColors(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCarFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getCarFeatures(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createCar(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createCarColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createCarColor(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createCarFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createCarFeature(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateCar(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateCar(req.params.id, req.body, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateCarColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateCarColor(
        req.params.slug,
        req.body,
        roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateCarFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateCarFeature(
        req.params.slug,
        req.body,
        roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteCar(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteCar(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteCarColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteCarColor(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteCarFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteCarFeature(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
