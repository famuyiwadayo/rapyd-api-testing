import { NextFunction, Request, Response } from "express";
import { DriverActivityService } from "../services";
import { sendError, sendResponse } from "../utils";

export default class DriverActivityController {
  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DriverActivityService.getActivities(req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DriverActivityService.getActiviy(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
