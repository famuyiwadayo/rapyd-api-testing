// @ts-nocheck

import { nanoid } from "nanoid";
import { makeRegistrationRequestDto, registerAccountDto } from "../interfaces/dtos";
import { AvailableResource, AvailableRole, registrationRequest, RegistrationRequest } from "../entities";
import { createError, removeForcedInputs, setExpiration, validateFields } from "../utils";
import AccountService from "./auth.service";
import RoleService from "./role.service";
import { Auth } from "../interfaces/ros";
import { PermissionScope } from "../valueObjects";
import EmailService, { Template } from "./email.service";

export default class RegistrationRequestService {
  public async makeRequest(input: makeRegistrationRequestDto, roles: string[]): Promise<RegistrationRequest> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.REGISTRATION_REQUEST, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);

    const token = RegistrationRequestService.generateUniqueToken();
    const r = await registrationRequest.create({
      token,
      primaryRole: input.role,
      email: input.email,
      expiry: setExpiration(0.5),
    });

    if (r)
      await EmailService.sendEmail("Rapydcars Administrator Invite", input.email, Template.ADMIN_INVITE, {
        link: `https://admin.rapydcars.com/register?token=${token}`,
        name: input.email,
      });

    return r;
  }

  public async registerAccount(input: registerAccountDto, deviceId: string): Promise<Auth> {
    input = removeForcedInputs(input as any, ["account"]);
    validateFields(input, ["email", "firstName", "lastName", "gender", "password", "token"]);
    const request = await registrationRequest
      .findOne({ token: input.token, used: false, expiry: { $gt: Date.now() } })
      .select(["primaryRole", "email"])
      .lean()
      .exec();
    if (!request) throw createError("Registration request is invalid", 400);
    if (request.email !== input.email) throw createError("Registration email does not match", 400);
    const auth = await new AccountService().register({ ...input }, deviceId, [request.primaryRole as string], true);
    await Promise.all([
      RegistrationRequestService.invalidateRequest(input.token),
      RegistrationRequestService.updateRegistrationAccount(input.token, auth.payload.sub),
    ]);
    return auth;
  }

  public async validateRequest(token: string): Promise<RegistrationRequest> {
    const request = await registrationRequest.findOne({ token }).lean().exec();
    if ((request && Date.now() > request.expiry!) || request?.used! === true) {
      RegistrationRequestService.invalidateRequest(token);
      throw createError("Request token has been used or expired", 401);
    }
    return request!;
  }

  public async getRequestedTokens(roles: string[]): Promise<RegistrationRequest[]> {
    // console.log(roles);
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.REGISTRATION_REQUEST, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);
    return await registrationRequest.find().populate("account").lean().exec();
  }

  static async invalidateRequest(token: string): Promise<boolean> {
    return Boolean(await registrationRequest.findOneAndUpdate({ token }, { used: true }, { new: true }));
  }

  static generateUniqueToken(): string {
    return nanoid(34);
  }

  static async updateRegistrationAccount(token: string, account: string) {
    return await registrationRequest.findOneAndUpdate({ token }, { account }, { new: true }).lean<RegistrationRequest>().exec();
  }
}
