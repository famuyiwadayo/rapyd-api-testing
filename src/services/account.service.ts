// @ts-nocheck

import {
  AccountDto,
  UpdateAccountDto,
  VerifyEmailDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from "../interfaces/dtos";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";
import { account, Account } from "../entities";
import { createError, paginate, removeForcedInputs } from "../utils";
import {
  PasswordService,
  RoleService,
  AuthVerificationService,
} from "../services";
import { PermissionScope, AuthVerificationReason } from "../valueObjects";

import { AvailableRole } from "../entities/role";
import { AvailableResource } from "../entities/rolePermission";

import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import { nanoid } from "nanoid";

export default class AccountService {
  private passwordService = new PasswordService();
  private authVerificationService = new AuthVerificationService();

  async createAccount(input: AccountDto, roles?: string[]): Promise<Account> {
    // validateFields(input);
    let acc = (await account.create({
      ...input,
      control: { enabled: true },
      refCode: nanoid(12),
      roles: roles ?? [],
      rapydId: AuthVerificationService.generateCode(),
    })) as Account;
    await this.passwordService.addPassword(acc._id!, input.password);
    roles && roles[0] && (await this.updatePrimaryRole(acc._id!, roles[0]));
    acc = (await account.findById(acc._id).lean().exec()) as Account;
    return acc;
  }

  async addBank(
    sub: string,
    input: AddBankDto,
    roles: string[]
  ): Promise<Account> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    if (!(await AccountService.checkAccountExists(sub)))
      throw createError("Account not found", 401);

    return await account
      .findByIdAndUpdate(sub, { bankDetails: { ...input } }, { new: true })
      .lean<Account>()
      .exec();
  }

  async deleteBankInfo(sub: string, roles: string[]): Promise<Account> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    if (!(await AccountService.checkAccountExists(sub)))
      throw createError("Account not found", 401);

    return await account
      .findByIdAndUpdate(sub, { bankDetails: null }, { new: true })
      .lean<Account>()
      .exec();
  }

  async getAccounts(
    roles: string[],
    filters: IPaginationFilter & {
      role?: AvailableRole;
      vehicleId?: string;
    } = {
      limit: "10",
      page: "1",
    }
  ): Promise<PaginatedDocument<Account[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    let queries: { $and?: any[] } = {};

    // this is probably gonna make operations a tardy bit slower.
    // aggregation could be used here to make it faster.
    if (filters?.role) {
      queries?.$and = [];
      const roleFilter = String(filters.role).split(",");
      const _roles = await RoleService.getRoleBySlugs(roleFilter);

      queries.$and.push({ roles: { $in: _roles?.map((r) => r?._id) } });
    }
    if (filters?.vehicleId) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and.push({ "vehicleInfo.vehicle": filters.vehicleId });
    }

    // console.log(JSON.stringify(queries));
    return await paginate("account", queries, filters);
  }

  async updatePrimaryRole(
    id: string,
    role: string,
    roles: string[],
    dryRun = true
  ): Promise<Account> {
    if (!dryRun)
      await RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN],
        roles,
        AvailableResource.ACCOUNT,
        [PermissionScope.UPDATE, PermissionScope.ALL]
      );

    const res = await RoleService.getRoleById(role);
    const acc = (await account
      .findOneAndUpdate({ _id: id }, { primaryRole: res.slug }, { new: true })
      .lean()
      .exec()) as Account;
    if (!acc) throw createError("Account not found", 404);
    return acc;
  }

  static async removeDeprecatedAccountRoles(
    accountId: string,
    roles: string[]
  ) {
    const toRun: any = [];
    const role = await RoleService.getRoleByIds(roles);
    const existingAccountRolesInDb = role?.map((r) => String(r._id));

    const rolesToDelete = difference(roles, existingAccountRolesInDb);
    if (!isEmpty(rolesToDelete)) {
      rolesToDelete.forEach((roleId) =>
        toRun.push(new RoleService().unassignRole(roleId, accountId, false))
      );
      return await Promise.all(toRun);
    }

    return [];
  }

  async accountById(id: string, roles: string[]) {
    const toRun = [
      AccountService.removeDeprecatedAccountRoles(id, roles),
      RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN],
        roles,
        AvailableResource.ACCOUNT,
        [PermissionScope.READ, PermissionScope.ALL]
      ),
    ];
    await Promise.all(toRun);

    let data = await account.findById(id).lean().exec();
    if (!data) throw createError(`Not found`, 404);
    if (!data?.refCode)
      data = await account
        .findByIdAndUpdate(id, { refCode: nanoid(12) }, { new: true })
        .lean()
        .exec();

    return data;
  }

  async currentUserAccount(id: string, roles: string[]) {
    const toRun = [
      AccountService.removeDeprecatedAccountRoles(id, roles),
      RoleService.requiresPermission(
        [
          AvailableRole.DRIVER,
          AvailableRole.MODERATOR,
          AvailableRole.SUPERADMIN,
        ],
        roles,
        AvailableResource.ACCOUNT,
        [PermissionScope.READ, PermissionScope.ALL]
      ),
    ];
    await Promise.all(toRun);

    let data = await account.findById(id).lean().exec();
    if (!data) throw createError(`Not found`, 404);
    if (!data?.refCode)
      data = await account
        .findByIdAndUpdate(id, { refCode: nanoid(12) }, { new: true })
        .lean()
        .exec();

    return data;
  }

  async updateAccount(id: string, roles: string[], input: UpdateAccountDto) {
    input = AccountService.removeUpdateForcedInputs(input);
    if (isEmpty(input)) throw createError("No valid input", 404);

    await RoleService.hasPermission(roles, AvailableResource.ACCOUNT, [
      PermissionScope.UPDATE,
      PermissionScope.ALL,
    ]);
    const data = await account
      .findOneAndUpdate({ _id: id }, { ...input }, { new: true })
      .lean()
      .exec();
    if (!data) throw createError(`Account not found`, 404);
    return data;
  }

  async changePassword(
    accountId: string,
    input: ChangePasswordDto,
    roles: string[]
  ): Promise<Account> {
    await RoleService.hasPermission(roles, AvailableResource.ACCOUNT, [
      PermissionScope.UPDATE,
      PermissionScope.ALL,
    ]);
    const acc = await this.passwordService.changePassword(accountId, input);
    return acc;
  }

  async deleteAccount(id: string, roles: string[]) {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );
    const data = await account
      .findOneAndDelete({ _id: id }, { new: true })
      .lean()
      .exec();
    if (!data) throw createError(`Not found`, 404);
    return data;
  }

  async disableAccount(id: string, roles: string[]) {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.DISABLE, PermissionScope.ALL]
    );
    const data = await account
      .findOneAndUpdate({ _id: id }, { control: { enabled: false } })
      .lean()
      .exec();
    if (!data) throw createError(`Account not found`, 404);
    return data;
  }

  async enableAccount(id: string, roles: string[]) {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.ACCOUNT,
      [PermissionScope.ENABLE, PermissionScope.ALL]
    );
    const data = await account
      .findOneAndUpdate({ _id: id }, { control: { enabled: true } })
      .lean()
      .exec();
    if (!data) throw createError(`Account not found`, 404);
    return data;
  }

  async verifyEmail(input: VerifyEmailDto, roles: string[]) {
    await RoleService.hasPermission(roles, AvailableResource.ACCOUNT, [
      PermissionScope.VERIFY,
      PermissionScope.ALL,
    ]);

    if (!(await AccountService.checkAccountExists(input.accountId)))
      throw createError("Account not found", 404);

    const verification =
      await this.authVerificationService.getEmailVerification(
        input.accountId,
        AuthVerificationReason.ACCOUNT_VERIFICATION,
        input.code,
        true
      );

    const _account = await account.findByIdAndUpdate(
      input.accountId,
      { isEmailVerified: true },
      { new: true }
    );

    await this.authVerificationService.removeVerification(verification._id);

    return _account;
  }

  async resetPassword(input: ResetPasswordDto) {
    if (!(await AccountService.checkAccountExists(input.accountId)))
      throw createError("Account not found", 404);

    const verification = await this.authVerificationService.getResetToken(
      input.accountId,
      AuthVerificationReason.ACCOUNT_PASSWORD_RESET,
      input.token,
      true
    );

    const _account = await this.passwordService.addPassword(
      input.accountId,
      input.password
    );

    await this.authVerificationService.removeVerification(verification._id);

    return _account;
  }

  async findByLogin(email: string, password: string): Promise<Account> {
    const acc = await account.findOne({ email }).lean().exec();
    if (!acc) throw createError("Account not found", 404);
    if (!(await this.passwordService.checkPassword(acc._id!, password)))
      throw createError("Incorrect password", 401);
    return acc;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const count = await account.countDocuments({ email }).exec();
    return count > 0;
  }

  static async checkAccountExists(id: string): Promise<boolean> {
    const count = await account.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  static removeUpdateForcedInputs(input: UpdateAccountDto) {
    return removeForcedInputs<Account, UpdateAccountDto>(input, [
      "_id",
      "email",
      "createdAt",
      "updatedAt",
      "password",
      "isApproved",
      "isEmailVerified",
      "control",
      "rapydId",
      "roles",
      "primaryRole",
      "refCode",
    ]);
  }
}
