import { NextFunction, Request, Response } from "express";
import { FinanceService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new FinanceService();

export default class FinanceController {
  async getSpreads(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getSpreads(
        req.user.sub,
        req.params.vehicleId,
        req.user.roles,
        req.query
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getPeriodicVehicleInstalment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getPeriodicVehicleInstalment(
        req.params.vehicleId,
        req.body,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCurrentUserVehicleFinanceAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getCurrentUserVehicleFinanceAnalysis(
        req.user.sub,
        req.params.vehicleId,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async makeInitialVehicleDeposit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.makeInitialVehicleDeposit(
        req.user.sub,
        req.params.vehicleId,
        req.body,
        req.user.roles
      );
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
