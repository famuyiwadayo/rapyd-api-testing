import { NextFunction, Request, Response } from "express";
import { VerifyMeService } from "../services";
import { sendError, sendResponse } from "../utils";

export default class VerifyMeController {
  // async addToWaitlist(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { email } = req.body;
  //     const data = await service.addToWaitlist(email);
  //     sendResponse(res, 201, data);
  //   } catch (error) {
  //     sendError(error, next);
  //   }
  // }

  async verifyNiN(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VerifyMeService.verifyNiN(req.body);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async verifyBvn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VerifyMeService.verifyBvn(req.body);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async verifyAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VerifyMeService.verifyAddress(req.body);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async verifyDriversLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VerifyMeService.verifyDriversLicense(req.body);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
