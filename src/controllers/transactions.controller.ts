import { NextFunction, Request, Response } from "express";
import { TransactionReferenceService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new TransactionReferenceService();

export default class TransactionController {
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, query } = req;
      const data = await service.getTransactionReferences(
        user.roles,
        query as any
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.getTransactionReference(
        params.ref,
        true,
        user.roles,
        true
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
