import { NextFunction, Request, Response } from "express";
import { GuarantorService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new GuarantorService();

export default class GuarantorController {
  async getCurrentUserGuarantors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await service.getCurrentUserGuarantors(
        req.user.sub,
        req.user.roles,
        req.query
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getGuarantors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getGuarantors(
        req.params.account,
        req.user.roles,
        req.query
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.addGuarantor(
        req.user.sub,
        req.body,
        req.user.roles
      );
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.deleteGuarantor(
        user.sub,
        params.id,
        user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
