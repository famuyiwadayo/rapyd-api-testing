import { NextFunction, Request, Response } from "express";
import { FinanceService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new FinanceService();

export default class FinanceController {
  async getFinanceById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getFinanceById(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleFinance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getVechicleFinance(
        req.params.vehicleId,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCurrentUserVehicleFinance(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getCurrentUserVechicleFinance(
        req.user.sub,
        req.params.vehicleId,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCurrentUserSpreads(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getCurrentUserSpreads(
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

  async getSpreads(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getSpreads(
        req.params.accountId,
        req.params.financeId,
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
