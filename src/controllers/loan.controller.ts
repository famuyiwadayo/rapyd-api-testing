import { NextFunction, Request, Response } from "express";
import { LoanService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new LoanService();

export default class LoanController {
  async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req;
      const data = await service.checkEligibility(user.sub, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async requestLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, user } = req;
      const data = await service.requestLoan(user.sub, body, user.roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, user } = req;
      const data = await service.getLoans(user.sub, user.roles, query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getLoansById(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.getLoanById(user.sub, params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async approveLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.approveLoan(params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async declineLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.declineLoan(params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
