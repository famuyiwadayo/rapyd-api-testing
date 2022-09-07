import { PaginatedDocument } from "../interfaces/ros";
import { createError, paginate } from "../utils";
import { PermissionScope } from "../valueObjects";
import { AvailableResource, AvailableRole, driverActivity, DriverActivity } from "../entities";
import RoleService from "./role.service";

export default class DriverActivityService {
  static async logActivity(acc: string, description: string, time: Date): Promise<DriverActivity> {
    return await driverActivity.create({ account: acc, description: description, time: time });
  }

  static async getActivities(roles: string[]): Promise<PaginatedDocument<DriverActivity[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ACTIVITY,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    return paginate("driverActivity", {}, {});
  }

  static async getActiviy(id: string, roles: string[]): Promise<DriverActivity> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ACTIVITY,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const activity = await driverActivity.findById(id).lean<DriverActivity>().exec();
    if (!activity) throw createError("Activity not found", 404);
    return activity;
  }
}
