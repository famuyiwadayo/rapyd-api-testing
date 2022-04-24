import { NextFunction, Request, Response } from "express";
import { RoleService } from "../services";
import { sendError, sendResponse } from "../utils";

const service = new RoleService();
export default class RoleController {
  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const result = await service.createResource(name);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.deleteResource(id);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.assignRole(
        req.params.roleId,
        req.body.accountId
      );
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async unassignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.unassignRole(
        req.params.roleId,
        req.body.accountId
      );
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const result = await service.createRole(name);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getResources(_: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getResources();
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getRoles(_: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getRoles();
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addPermission(req: Request, res: Response, next: NextFunction) {
    try {
      //   const { roleId, resourceId, scopes } = req.body;
      const result = await service.addPermission(req.params.id, req.body);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async revokePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, resId } = req.params;
      const result = await service.revokePermission(id, resId);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.getPermissions(id);
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async addPermissionScopes(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId, scopes } = req.body;
      const result = await service.addPermissionScopes(
        req.params.roleId,
        resourceId,
        scopes
      );
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }

  async revokePermissionScope(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, resourceId, scope } = req.params;
      const result = await service.revokePermissionScope(
        roleId,
        resourceId,
        scope as any
      );
      sendResponse(res, 201, result);
    } catch (error) {
      sendError(error, next);
    }
  }
}
