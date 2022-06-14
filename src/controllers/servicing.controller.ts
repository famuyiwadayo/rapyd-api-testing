import { NextFunction, Request, Response } from "express";
import { ServicingService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new ServicingService();

export default class ServicingController {
  async createServicing(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.createServicing(req.body, req.user.roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAllServicing(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getAllServicing(req.user.roles, req.query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCurrentUserTotalVehicleService(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getCurrentUserTotalVehicleService(
        req.user.sub,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAllCurrentUserServicing(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getAllCurrentUserServicing(
        req.user.sub,
        req.user.roles,
        req.query
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateServicingComment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.updateServicingComment(
        req.params.id,
        req.body,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteServicing(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.deleteServicing(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
