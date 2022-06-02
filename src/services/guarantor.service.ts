import {
  createError,
  getUpdateOptions,
  removeForcedInputs,
  validateFields,
} from "utils";
import { PermissionScope } from "valueObjects";
import {
  guarantor,
  Guarantor,
  AvailableRole,
  AvailableResource,
} from "../entities";
import AccessService from "./access.service";
import RoleService from "./role.service";

export default class GuarantorService {
  private static async addMultipleGuarantor(
    guarantors: Partial<Guarantor>[]
  ): Promise<Guarantor[]> {}

  async addGuarantor(input: Guarantor, roles: string[]): Promise<Guarantor> {
    input = removeForcedInputs(input, ["_id", "createdAt", "updatedAt"]);
    validateFields(input, ["email"]);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.DRIVER],
      roles,
      AvailableResource.GUARANTOR,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    if (!(await GuarantorService.checkGuarantorExistsByEmail(input.email)))
      throw createError("Guarantor already exists", 403);

    const g = await guarantor.create({ ...input });
    return g;
  }

  async deleteGuarantor(
    sub: string,
    id: string,
    roles: string[]
  ): Promise<Guarantor> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.DRIVER],
      roles,
      AvailableResource.GUARANTOR,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    const isAdmin = await GuarantorService.hasAdminPrivileges(roles);
    if (!isAdmin)
      await AccessService.documentBelongsToAccount(sub, id, "account");

    return await guarantor
      .findByIdAndDelete(id, { new: true })
      .lean<Guarantor>()
      .exec();
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
    return await RoleService.hasOneOrMore([AvailableRole.SUPERADMIN], roles);
  }
}
