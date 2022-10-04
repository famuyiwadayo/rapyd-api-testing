import {
  createError,
  paginate,
  // getUpdateOptions,
  removeForcedInputs,
  setExpiration,
  validateFields,
} from "../utils";
import { PermissionScope } from "../valueObjects";
import { guarantor, Guarantor, AvailableRole, AvailableResource, account, Account, GuarantorVerificationStatus } from "../entities";
import AccessService from "./access.service";
import RoleService from "./role.service";
import { IPaginationFilter, PaginatedDocument } from "interfaces/ros";
import EmailService, { Template } from "./email.service";
import { isEmpty, join } from "lodash";
import RegistrationRequestService from "./registrationRequest.service";

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

  public async verifyGuarantor(id: string, roles: string[]): Promise<Guarantor> {
    await RoleService.hasPermission(roles, AvailableResource.GUARANTOR, [PermissionScope.VERIFY, PermissionScope.ALL]);
    let g = await guarantor.findById(id).populate("account").lean<Guarantor>().exec();
    if (!g) throw createError("Guarantor not found", 404);
    if (g?.attempts < 1) throw createError("Guarantor form has not been updated", 403);

    g = await guarantor
      .findByIdAndUpdate(id, { status: GuarantorVerificationStatus.VERIFIED }, { new: true })
      .lean<Guarantor>()
      .exec();

    const driver = g.account as Account;
    if (!driver) throw createError("Driver's information not found", 404);
    await EmailService.sendEmail(`Your guarantor ${g?.name} has been verified`, driver.email, Template.GUARANTOR_VERFICATION, {
      name: join([driver?.firstName, driver?.lastName], " "),
      link: `https://admin.rapydcars.com/guarantor/form?token=${g?.token}`,
    });

    return g;
  }

  public async rejectGuarantor(id: string, roles: string[]): Promise<Guarantor> {
    await RoleService.hasPermission(roles, AvailableResource.GUARANTOR, [PermissionScope.REJECT, PermissionScope.ALL]);
    let g = await guarantor.findById(id).populate("account").lean<Guarantor>().exec();
    if (!g) throw createError("Guarantor not found", 404);
    if (g?.attempts < 1) throw createError("Guarantor form has not been updated", 403);

    g = await guarantor
      .findByIdAndUpdate(id, { status: GuarantorVerificationStatus.REJECTED }, { new: true })
      .lean<Guarantor>()
      .exec();

    const driver = g.account as Account;
    if (!driver) throw createError("Driver's information not found", 404);
    await EmailService.sendEmail(`Your guarantor ${g?.name} has been rejected`, driver.email, Template.GUARANTOR_REJECTION, {
      name: join([driver?.firstName, driver?.lastName], " "),
      link: `https://admin.rapydcars.com/guarantor/form?token=${g?.token}`,
    });

    return g;
  }

  public async updateGuaratorWithToken(token: string, input: Guarantor) {
    if (!token) throw createError("token param is required", 400);
    input = removeForcedInputs(input, ["_id", "account", "used", "attempts", "createdAt", "expiry", "updatedAt", "status", "token"]);

    validateFields(input, [
      "nameOfApplicant",
      "documents",
      "homeAddress",
      "name",
      "homeAddress",
      "phone",
      "signedLetter",
      "workAddress",
      "howLongSinceKnownTheApplicant",
      "relationshipWithApplicant",
    ]);

    const g = await this.validateRequest(token);
    const result = await guarantor
      .findByIdAndUpdate(g?._id, { ...input, $inc: { attempts: 1 } }, { new: true })
      .lean<Guarantor>()
      .exec();
    return result;
  }

  public async validateRequest(token: string): Promise<Guarantor> {
    const request = await guarantor.findOne({ token }).lean().exec();
    if (!request) throw createError("Guarantor not found", 404);
    if ((request && Date.now() > request.expiry!) || request?.used! === true) {
      GuarantorService.invalidateRequest(token);
      throw createError("Guarantor form link has expired, please request another one.", 401);
    }
    return request!;
  }

  static async invalidateRequest(token: string): Promise<boolean> {
    return Boolean(await guarantor.findOneAndUpdate({ token }, { used: true }, { new: true }));
  }

  public static async addMultipleGuarantor(
    accountId: string,
    guarantors: Omit<Guarantor, "createdAt" | "updatedAt">[]
  ): Promise<Guarantor[]> {
    let g = guarantors.map((g) => ({ ...g, account: accountId }));
    g = (await this.SendGuarantorRequestEmails(accountId, guarantors)) as typeof g;
    return await guarantor.insertMany([...g], { lean: true });
  }

  private static async SendGuarantorRequestEmails(driverId: string, guarantors: Omit<Guarantor, "createdAt" | "updatedAt">[]) {
    if (isEmpty(guarantors)) return;
    const driver = await account.findById(driverId).select(["firstName", "lastName"]).lean<Account>().exec();

    // guarantor's token will expire in 15days.
    guarantors = guarantors.map((g) => ({
      ...g,
      token: RegistrationRequestService.generateUniqueToken(),
      expiry: setExpiration(15),
    }));
    await Promise.all(
      guarantors.map((gua) =>
        EmailService.sendEmail("You've been appointed as a guarantor", gua?.email, Template.GUARANTOR_INVITE, {
          name: join([driver?.firstName, driver?.lastName], " "),
          link: `https://admin.rapydcars.com/guarantor/form?token=${gua?.token}`,
        })
      )
    );

    return guarantors;
  }
}
