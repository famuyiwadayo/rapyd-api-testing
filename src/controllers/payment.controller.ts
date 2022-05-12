import { NextFunction, Request, Response } from "express";
import { PaymentService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new PaymentService();

export default class PaymentController {
  async initialize(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.initTransaction(sub, roles, req.body);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.checkStatus(req.params.ref);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addPaymentItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.addPaymentItem(req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updatePaymentItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.updatePaymentItem(
        req.params.itemId,
        req.body,
        roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deletePaymentItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.deletePaymentItem(req.params.itemId, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getPaymentItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getPaymentItem(req.params.itemId, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getPaymentItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const data = await service.getPaymentItems(roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
