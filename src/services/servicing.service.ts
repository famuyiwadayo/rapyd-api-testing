import { PermissionScope } from "../valueObjects";
import {
  AvailableResource,
  AvailableRole,
  servicing,
  Servicing,
} from "../entities";
import { CreateServicingDto } from "../interfaces/dtos";
import RoleService from "./role.service";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";
import {
  createError,
  paginate,
  removeForcedInputs,
  validateFields,
} from "../utils";

export default class ServicingService {
  async createServicing(
    input: CreateServicingDto,
    roles: string[]
  ): Promise<Servicing> {
    input = removeForcedInputs(input, [
      "comment",
      "updatedAt",
      "createdAt",
      "_id",
    ]);
    validateFields(input, ["date", "location", "odometer", "driver"]);
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.SERVICING,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    const _ser = await servicing.create({ ...input });
    return _ser;
  }

  async getAllServicing(
    roles: string[],
    filters: IPaginationFilter = { limit: "10", page: "1" }
  ): Promise<PaginatedDocument<Servicing[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.SERVICING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    return await paginate("servicing", {}, filters);
  }

  async updateServicingComment(
    serviceId: string,
    input: { comment: string },
    roles: string[]
  ): Promise<Servicing> {
    input = removeForcedInputs(input as any, [
      "createdAt",
      "updatedAt",
      "location",
      "odometer",
      "driver",
      "date",
    ]);
    validateFields(input, ["comment"]);
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.SERVICING,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const _ser = await servicing.findByIdAndUpdate(
      serviceId,
      { comment: input.comment },
      { new: true }
    );
    if (!_ser) throw createError("Service not found", 404);
    return _ser;
  }

  async deleteServicing(
    serviceId: string,
    roles: string[]
  ): Promise<Servicing> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.SERVICING,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _ser = await servicing.findByIdAndDelete(serviceId, { new: true });
    if (!_ser) throw createError("Service not found", 404);
    return _ser;
  }
}
