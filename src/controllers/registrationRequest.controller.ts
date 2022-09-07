import { Request, Response, NextFunction } from "express";
import { sendError, sendResponse } from "../utils";
import { makeRegistrationRequestDto, registerAccountDto } from "../interfaces/dtos";
import { RegistrationRequestService } from "../services";

export default class RegistrationRequestController {
  public async makeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await new RegistrationRequestService().makeRequest(req.body as makeRegistrationRequestDto, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  public async registerAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.headers["device-id"] as string;
      const result = await new RegistrationRequestService().registerAccount(req.body as registerAccountDto, deviceId);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  public async validateRequestToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await new RegistrationRequestService().validateRequest(req.params.token as string);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  public async getRequestedTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await new RegistrationRequestService().getRequestedTokens(req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }
}
