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
      const data = await service.getDriverOnboardingInfo(sub, roles);
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

  async createDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createDocumentUpload(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
