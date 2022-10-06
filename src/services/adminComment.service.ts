import { PaginatedDocument } from "../interfaces/ros";
import { RapydBus } from "../libs";
import { createError, paginate, validateFields } from "../utils";
import { PermissionScope } from "../valueObjects";
import { adminComment, AdminComment, AvailableResource } from "../entities";
import RoleService from "./role.service";

import { AdminCommentEventListener } from "../listerners";
import { AdminCommentStatus } from "../entities/adminComment";

export default class AdminCommentService {
  async getAll(roles: string[]): Promise<PaginatedDocument<AdminComment[]>> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.READ, PermissionScope.ALL]);
    return paginate(
      "adminComment",
      {},
      {},
      {
        populate: ["creator", "resolver"],
      }
    );
  }

  async getById(id: string, roles: string[]): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.READ, PermissionScope.ALL]);
    const comment = await adminComment.findById(id).populate(["creator", "resolver"]).lean<AdminComment>().exec();
    if (!comment) throw createError("Comment not found", 404);
    return comment;
  }

  async create(
    sub: string,
    input: Omit<AdminComment, "_id" | "createdAt" | "updatedAt" | "creator">,
    roles: string[]
  ): Promise<AdminComment> {
    validateFields(input, ["driver", "title", "description"]);
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.CREATE, PermissionScope.ALL]);
    const comment = await adminComment.create({ ...input, creator: sub });
    await RapydBus.emit("adminComment:created", { creator: sub, account: input.driver as string });
    return comment;
  }

  async update(
    sub: string,
    id: string,
    input: Partial<Omit<AdminComment, "_id" | "createdAt" | "updatedAt" | "creator">>,
    roles: string[]
  ): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.UPDATE, PermissionScope.ALL]);
    const comment = await adminComment
      .findByIdAndUpdate(id, { ...input }, { new: true })
      .lean<AdminComment>()
      .exec();
    if (!comment) throw createError("Comment not found", 404);
    await RapydBus.emit("adminComment:updated", { creator: sub as string, account: comment?.driver as string });
    return comment;
  }

  async resolve(sub: string, id: string, roles: string[]): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.UPDATE, PermissionScope.ALL]);
    const comment = await adminComment
      .findByIdAndUpdate(id, { status: AdminCommentStatus.RESOLVED, resolver: sub }, { new: true })
      .lean<AdminComment>()
      .exec();
    if (!comment) throw createError("Comment not found", 404);
    await RapydBus.emit("adminComment:resolved", { resolver: sub as string, account: comment?.driver as string });
    return comment;
  }

  async delete(sub: string, id: string, roles: string[]): Promise<AdminComment> {
    await RoleService.hasPermission(roles, AvailableResource.ADMIN_COMMENT, [PermissionScope.UPDATE, PermissionScope.ALL]);
    const comment = await adminComment.findByIdAndDelete(id, { new: true }).lean<AdminComment>().exec();
    if (!comment) throw createError("Comment not found", 404);
    await RapydBus.emit("adminComment:updated", { creator: sub, account: comment?.driver as string });
    return comment;
  }

  // Typescript will compile this anyways, we don't need to invoke the mountEventListener.
  // When typescript compiles the AccountEventListener, the addEvent decorator will be executed.
  static mountEventListener() {
    new AdminCommentEventListener();
  }
}
