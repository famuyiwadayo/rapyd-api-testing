import { NextFunction, Request, Response } from "express";
import { EmailService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new EmailService();

export default class EmailController {
  async addToWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await service.addToWaitlist(email);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
