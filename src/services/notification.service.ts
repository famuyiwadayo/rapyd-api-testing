import { account, Account, AvailableResource, AvailableRole, notification, Notification } from "../entities";
import join from "lodash/join";
import RoleService from "./role.service";
import { PermissionScope } from "../valueObjects";
import { paginate } from "../utils";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";

export default class NotificationService {
  async getNotifications(sub: string, roles: string[], filter?: IPaginationFilter): Promise<PaginatedDocument<Notification[]>> {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.NOTIFICATION, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    return await paginate("notification", { isAdmin: false, owner: sub }, filter);
  }

  async getAdminNotifications(roles: string[], filter?: IPaginationFilter): Promise<PaginatedDocument<Notification[]>> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.NOTIFICATION, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    return await paginate("notification", { isAdmin: true }, filter, { populate: ["modifier"] });
  }

  static async create(input: Partial<Notification>) {
    return await notification.create({ ...input });
  }

  static async getAccount(modifierId: string): Promise<(Account & { name: string }) | null> {
    const acc = await account.findById(modifierId).select(["firstName", "lastName", "email"]).lean<Account>().exec();
    if (!acc) return null;
    return { ...acc, name: join([acc?.firstName, acc?.lastName]) };
  }
}