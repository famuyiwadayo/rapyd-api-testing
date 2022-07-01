import { NextFunction, Request, Response } from "express";
import { EmailService, Template } from "../services";
import { sendError, sendResponse } from "../utils";

// const service = new EmailService();

export default class EmailController {
  // async addToWaitlist(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { email } = req.body;
  //     const data = await service.addToWaitlist(email);
  //     sendResponse(res, 201, data);
  //   } catch (error) {
  //     sendError(error, next);
  //   }
  // }

  async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;
      const data = await EmailService.sendEmail("📧 Verify your email address", email, Template.RESET_PASSWORD, {
        link: "https://famuyiwadayo.com",
        name,
      });
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
