import { NextFunction, Request, Response } from "express";
import { OnboardingService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new OnboardingService();

export default class OnboardingController {
  async getDriverOnboardingInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sub, roles } = req.user;
      const data = await service.getDriverOnboardingInfo(
        sub,
        roles,
        req.query.dryRun as any
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.getApplicationStatus(
        sub,
        roles,
        req.query.dryRun as any
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createBiodata(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createBiodata(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addGuarantors(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.addGuarantors(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createDocumentUpload(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async selectVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.selectVehicle(
        sub,
        req.params.vehicleId,
        req.body,
        roles
      );
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async hirePurchaseContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createHirePurchaseContract(
        sub,
        req.body,
        roles
      );
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.makePayment(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async approveApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.approveApplication(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
