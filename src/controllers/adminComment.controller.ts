import { NextFunction, Request, Response } from "express";
import { AdminCommentService } from "../services";
import { sendError, sendResponse } from "../utils";

export default class AdminCommentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await new AdminCommentService().getAll(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await new AdminCommentService().getById(req.params.id, req.user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, body } = req;
      const data = await new AdminCommentService().create(user.sub, body, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, body, params } = req;
      const data = await new AdminCommentService().update(user.sub, params.id, body, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await new AdminCommentService().resolve(user.sub, params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, params } = req;
      const data = await new AdminCommentService().delete(user.sub, params.id, user.roles);
      sendResponse(res, 200, data);
    } catch (error) {
      sendError(error, next);
    }
  }
}
