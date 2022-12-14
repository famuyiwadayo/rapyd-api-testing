import { NextFunction, Request, Response } from "express";
import { AccountService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new AccountService();
export default class AccountController {
  async testAccountEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req;
      const result = await service.testEvent(user.sub, user.roles);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const result = await service.createAccount(body);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getOnlineOfflineVehicleStat(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req;
      const result = await service.getOnlineOfflineVehicleStat(user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getVehicleStatusAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        user,
        query: { date },
      } = req;

      const result = await service.getVehicleStatusAnalysis(user.roles, { date: date as any });
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addBank(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, user } = req;
      const result = await service.addBank(user.sub, body, user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateBank(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, user } = req;
      const result = await service.updateBank(user.sub, body, user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      // console.log("account", req.query);
      const result = await service.getAccounts(req.user.roles, req?.query as any);
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

  async updateVehicleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { roles, sub } = req.user;
      const result = await service.updateVehicleStatus(sub, req.params.id, req.body, roles);
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
      const result = await service.deleteAccount(req.user.sub, id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteBankInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.deleteBankInfo(req.user.sub, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async disableAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await service.disableAccount(req.user.sub, id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async enableAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await service.enableAccount(req.user.sub, id, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updatePrimaryRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.updatePrimaryRole(req.params.id, req.body.role, req.user.roles);
      sendResponse(res, 200, result);
    } catch (error) {
      sendError(error, next);
    }
  }
}
