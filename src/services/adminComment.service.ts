import { PaginatedDocument } from "../interfaces/ros";
import { RapydBus } from "../libs";
import { createError, paginate } from "../utils";
import { PermissionScope } from "../valueObjects";
import { adminComment, AdminComment, AvailableResource } from "../entities";
import RoleService from "./role.service";

import { AdminCommentEventListener } from "../listerners";

export default class AdminCommentService {
  async getAll(roles: string[]): Promise<PaginatedDocument<AdminComment[]>> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.READ, PermissionScope.ALL]);
    return paginate("adminComment", {}, {});
  }

  async getById(id: string, roles: string[]): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.READ, PermissionScope.ALL]);
    const comment = await adminComment.findById(id).lean<AdminComment>().exec();
    if (!comment) throw createError("Comment not found", 404);
    return comment;
  }

  async create(
    sub: string,
    input: Omit<AdminComment, "_id" | "createdAt" | "updatedAt" | "account">,
    roles: string[]
  ): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.CREATE, PermissionScope.ALL]);
    const comment = await adminComment.create({ ...input, account: sub });
    await RapydBus.emit("adminComment:created", { account: sub });
    return comment;
  }

  async update(
    sub: string,
    id: string,
    input: Partial<Omit<AdminComment, "_id" | "createdAt" | "updatedAt" | "account">>,
    roles: string[]
  ): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.UPDATE, PermissionScope.ALL]);
    const comment = await adminComment
      .findByIdAndUpdate(id, { ...input }, { new: true })
      .lean<AdminComment>()
      .exec();
    if (!comment) throw createError("Comment not found", 404);
    await RapydBus.emit("adminComment:updated", { account: sub });
    return comment;
  }

  async delete(sub: string, id: string, roles: string[]): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.UPDATE, PermissionScope.ALL]);
    const comment = await adminComment.findByIdAndDelete(id, { new: true }).lean<AdminComment>().exec();
    if (!comment) throw createError("Comment not found", 404);
    await RapydBus.emit("adminComment:updated", { account: sub });
    return comment;
  }

  // Typescript will compile this anyways, we don't need to invoke the mountEventListener.
  // When typescript compiles the AccountEventListener, the addEvent decorator will be executed.
  static mountEventListener() {
    new AdminCommentEventListener();
  }
}
