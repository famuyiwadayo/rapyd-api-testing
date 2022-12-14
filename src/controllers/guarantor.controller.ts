import { NextFunction, Request, Response } from "express";
import { GuarantorService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new GuarantorService();

export default class GuarantorController {
  async getCurrentUserGuarantors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getCurrentUserGuarantors(req.user.sub, req.user.roles, req.query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getGuarantors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getGuarantors(req.user.roles, req.query);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getGuarantorById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getGuarantorById(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.addGuarantor(req.user.sub, req.body, req.user.roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateGuarantorWithToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.updateGuaratorWithToken(req.params.token, req.body);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async verifyGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.verifyGuarantor(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async rejectGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.rejectGuarantor(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async validateGuarantorFormToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.validateRequest(req.params.token);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  // async resendFormLink(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = await GuarantorService.sendGuarantorInvite(req.params.id, )
  //     sendResponse(res, 200, data);
  //   } catch (error) {
  //     sendError(error, next);
  //   }
  // }

  async deleteGuarantor(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await service.deleteGuarantor(user.sub, params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
