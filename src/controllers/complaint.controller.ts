import { NextFunction, Request, Response } from "express";
import { ComplaintService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new ComplaintService();

export default class ComplaintController {
  async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getComplaintById(
        req.params.id,
        req.user.roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getComplaints(
        req.user.roles,
        req.query as any
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getComplaintFeedbacks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.getComplaintFeedbacks(
        req.params.id,
        req.user.roles,
        req.query as any
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createComplaint(sub, req.body, roles);
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createComplaintFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sub, roles } = req.user;
      const data = await service.createComplaintFeedback(
        sub,
        req.params.id,
        req.body,
        roles
      );
      sendResponse(res, 201, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.updateComplaint(
        sub,
        req.params.id,
        req.body,
        roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async updateComplaintFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { roles } = req.user;
      const data = await service.updateComplaintFeedback(
        req.params.id,
        req.body,
        roles
      );
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, roles } = req.user;
      const data = await service.deleteComplaint(sub, req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteComplaintFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { roles } = req.user;
      const data = await service.deleteComplaintFeedback(req.params.id, roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
