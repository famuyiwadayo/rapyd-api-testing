import { NextFunction, Request, Response } from "express";
import { AccountService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new AccountService();
export default class AccountController {
  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const result = await service.createAccount(body);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      // console.log("account", req.query);
      const result = await service.getAccounts(
        req.user.roles,
        req?.query as any
      );
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async accountById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles } = req.user;
      const result = await service.accountById(req.params.id, roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getCurrentUserAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: id, roles } = req.user;
      const result = await service.currentUserAccount(id, roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: id, roles } = req.user;
      const result = await service.updateAccount(id, roles, req.body);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const result = await service.changePassword(sub, req.body, roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await service.deleteAccount(id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async disableAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await service.disableAccount(id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async enableAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await service.enableAccount(id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updatePrimaryRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.updatePrimaryRole(
        req.params.id,
        req.body.role
      );
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }
}
