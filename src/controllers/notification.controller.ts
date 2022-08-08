import { NextFunction, Request, Response } from "express";
import { NotificationService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new NotificationService();

export default class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, query } = req;
      const data = await service.getNotifications(user.sub, user.roles, query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, body } = req;
      const data = await service.markAsRead(user.sub, body.ids, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAdminNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, query } = req;
      const data = await service.getAdminNotifications(user.roles, query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
