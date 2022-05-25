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
import { paginate } from "../utils";

export default class ServicingService {
  async createServicing(
    input: CreateServicingDto,
    roles: string[]
  ): Promise<Servicing> {
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
}
