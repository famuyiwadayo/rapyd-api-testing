import {
  createError,
  paginate,
  // getUpdateOptions,
  removeForcedInputs,
  validateFields,
} from "../utils";
import { PermissionScope } from "../valueObjects";
import { guarantor, Guarantor, AvailableRole, AvailableResource } from "../entities";
import AccessService from "./access.service";
import RoleService from "./role.service";
import { IPaginationFilter, PaginatedDocument } from "interfaces/ros";

export default class GuarantorService {
  async getGuarantors(account: string, roles: string[], filters: IPaginationFilter): Promise<PaginatedDocument<Guarantor[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.GUARANTOR,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const query: { account: string } = { account };

    // const isAdmin = await GuarantorService.hasAdminPrivileges(roles);
    // if (!isAdmin) Object.assign(query, { account: sub });

    return await paginate("guarantor", query, filters);
  }

  async getCurrentUserGuarantors(sub: string, roles: string[], filters: IPaginationFilter): Promise<PaginatedDocument<Guarantor[]>> {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.GUARANTOR, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const query: { account: string } = { account: sub };

    // const isAdmin = await GuarantorService.hasAdminPrivileges(roles);
    // if (!isAdmin) Object.assign(query, { account: sub });

    return await paginate("guarantor", query, filters);
  }

  async addGuarantor(sub: string, input: Guarantor, roles: string[]): Promise<Guarantor> {
    input = removeForcedInputs(input, ["_id", "createdAt", "updatedAt"]);
    validateFields(input, ["email"]);

    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.GUARANTOR, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);

    if (await GuarantorService.checkGuarantorExistsByEmail(input.email)) throw createError("Guarantor already exists", 403);

    const g = await guarantor.create({ ...input, account: sub });
    return g;
  }

  async deleteGuarantor(sub: string, id: string, roles: string[]): Promise<Guarantor> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.DRIVER, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.GUARANTOR,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const query: { _id: string; account?: string } = { _id: id };

    const isAdmin = await GuarantorService.hasAdminPrivileges(roles);
    if (!isAdmin && (await AccessService.documentBelongsToAccount(sub, id, "guarantor"))) Object.assign(query, { account: sub });

    return await guarantor.findOneAndDelete(query, { new: true }).lean<Guarantor>().exec();
  }

  static async checkGuarantorExists(id: string): Promise<boolean> {
    const count = await guarantor.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  static async checkGuarantorExistsByEmail(email: string): Promise<boolean> {
    const count = await guarantor.countDocuments({ email }).exec();
    return count > 0;
  }

  static async hasAdminPrivileges(roles: string[]): Promise<boolean> {
    return await RoleService.hasOneOrMore(
      [AvailableRole.SUPERADMIN, AvailableRole.FLEET_MANAGER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.MODERATOR],
      roles
    );
  }

  public static async addMultipleGuarantor(
    account: string,
    guarantors: Omit<Guarantor, "createdAt" | "updatedAt">[]
  ): Promise<Guarantor[]> {
    const g = guarantors.map((g) => ({ ...g, account }));
    return await guarantor.insertMany([...g], { lean: true });
  }
}
