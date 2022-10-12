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
import { RapydBus } from "../libs";

import { GuarantorEventListerner } from "../listerners";

export default class GuarantorService {
  async getGuarantors(
    roles: string[],
    filters?: IPaginationFilter & { account?: string; status?: string }
  ): Promise<PaginatedDocument<Guarantor[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.GUARANTOR,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    let queries: { account?: string; $and?: any[] } = {};

    const statuses = String(filters?.status).split(",");

    if (!!filters?.account) {
      Object.assign(queries, { account: filters.account });
    }

    if (filters?.status) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: statuses.map((status) => ({ status })),
      });
    }

    // const isAdmin = await GuarantorService.hasAdminPrivileges(roles);
    // if (!isAdmin) Object.assign(query, { account: sub });

    return await paginate("guarantor", queries, filters, { populate: ["account"] });
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

  async getGuarantorById(id: string, roles: string[]): Promise<Guarantor> {
    await RoleService.hasPermission(roles, AvailableResource.GUARANTOR, [PermissionScope.READ, PermissionScope.ALL]);
    const g = await guarantor.findById(id).populate("account").lean<Guarantor>().exec();
    if (!g) throw createError("Guarantor not found", 400);
    return g;
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
    await RapydBus.emit("guarantor:added", { account: sub, guarantor: { email: input.email } as any });
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

    await RapydBus.emit("guarantor:deleted", { account: sub, guarantorId: id });
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

    await RapydBus.emit("guarantor:verified", { account: g?.account as string, guarantor: g });

    // TODO: Can be moved to the guarantor.listener verified event
    await EmailService.sendEmail(`Your guarantor ${g?.name} has been verified`, driver.email, Template.GUARANTOR_VERFICATION, {
      name: driver?.firstName,
      guarantor_name: g?.name ?? "",
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

    await RapydBus.emit("guarantor:rejected", { account: g?.account as string, guarantor: g });

    // TODO: Can be moved to the guarantor.listener rejected event
    await EmailService.sendEmail(`Your guarantor ${g?.name} has been rejected`, driver.email, Template.GUARANTOR_REJECTION, {
      name: driver?.firstName,
      guarantor_name: g?.name ?? "",
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

    await RapydBus.emit("guarantor:form:attempted", { account: String(g?.account), guarantor: g });
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
    // g = (await this.SendGuarantorRequestEmails(accountId, guarantors)) as typeof g;
    return await guarantor.insertMany([...g], { lean: true });
  }

  static async sendGuarantorInvite(
    driverId: string,
    guarantors: Omit<Guarantor, "createdAt" | "updatedAt">[],
    roles: string[],
    dryRun = false
  ) {
    if (isEmpty(guarantors)) return;

    if (!dryRun) await RoleService.hasPermission(roles, AvailableResource.GUARANTOR, [PermissionScope.READ, PermissionScope.ALL]);
    const g = (await this.SendGuarantorRequestEmails(driverId, guarantors)) as Guarantor[];
    await Promise.all(
      g?.map((vals) =>
        guarantor
          .findOneAndUpdate({ email: vals.name }, { ...vals })
          .lean<Guarantor>()
          .exec()
      )
    );
  }

  static async SendGuarantorRequestEmails(driverId: string, guarantors: Omit<Guarantor, "createdAt" | "updatedAt">[]) {
    if (isEmpty(guarantors)) return;
    const driver = await account.findById(driverId).select(["firstName"]).lean<Account>().exec();

    // guarantor's token will expire in 15days.
    guarantors = guarantors.map((g) => ({
      ...g,
      token: RegistrationRequestService.generateUniqueToken(),
      expiry: setExpiration(15),
    }));
    await Promise.all(
      guarantors.map((gua) =>
        EmailService.sendEmail("You've been appointed as a guarantor", gua?.email, Template.GUARANTOR_INVITE, {
          driver_name: join([driver?.firstName, driver?.lastName], " "),
          name: gua?.email,
          link: `https://rapydcars.com/guarantor/form?token=${gua?.token}`,
        })
      )
    );

    return guarantors;
  }

  // Typescript will compile this anyways, we don't need to invoke the mountEventListener.
  // When typescript compiles the AccountEventListener, the addEvent decorator will be executed.
  static mountEventListener() {
    new GuarantorEventListerner();
  }
}
