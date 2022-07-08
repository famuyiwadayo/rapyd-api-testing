import { NextFunction, Request, Response } from "express";
import { VehicleService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new VehicleService();

export default class VehicleController {
  async getAvailableVehicleMakes(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getAvailableVehicleMakes(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getTotalVehicleCount(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        user,
        query: { date },
      } = req;
      const data = await service.getTotalVehicleCount(user.roles, { date: date as string });
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAvailableVehicleMakeModels(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.getAvailableVehicleMakeModel(params.make, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getVehicleById(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getSimilarVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getSimilarVehicles(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getVehicles(roles, req.query as any);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleColors(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getVehicleColors(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getVehicleTypes(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getVehicleFeatures(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createVehicle(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createVehicleColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createVehicleColor(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createVehicleType(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createVehicleFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.createVehicleFeature(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateVehicle(req.params.id, req.body, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateVehicleColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateVehicleColor(req.params.slug, req.body, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateVehicleType(req.params.slug, req.body, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateVehicleFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updateVehicleFeature(req.params.slug, req.body, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteVehicle(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteVehicleColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteVehicleColor(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteVehicleType(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteVehicleFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deleteVehicleFeature(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
