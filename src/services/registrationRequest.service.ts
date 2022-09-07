// @ts-nocheck

import { nanoid } from "nanoid";
import { makeRegistrationRequestDto, registerAccountDto } from "../interfaces/dtos";
import { AvailableResource, AvailableRole, registrationRequest, RegistrationRequest } from "../entities";
import { createError, setExpiration } from "../utils";
import AccountService from "./auth.service";
import RoleService from "./role.service";
import { Auth } from "../interfaces/ros";
import { PermissionScope } from "../valueObjects";

export default class RegistrationRequestService {
  public async makeRequest(input: makeRegistrationRequestDto, roles: string[]): Promise<RegistrationRequest> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.REGISTRATION_REQUEST, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);
    return await registrationRequest.create({
      token: RegistrationRequestService.generateUniqueToken(),
      primaryRole: input.role,
      email: input.email,
      expiry: setExpiration(0.5),
    });
  }

  public async registerAccount(input: registerAccountDto, deviceId: string): Promise<Auth> {
    const request = await registrationRequest
      .findOne({ token: input.token, used: false, expiry: { $gt: Date.now() } })
      .select(["primaryRole", "email"])
      .lean()
      .exec();
    if (!request) throw createError("Registration request is invalid", 400);
    if (request.email !== input.email) throw createError("Registration email does not match", 400);
    const auth = await new AccountService().register({ ...input }, deviceId, [request.primaryRole as string]);
    await RegistrationRequestService.invalidateRequest(input.token);
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
    return await registrationRequest.find().lean().exec();
  }

  static async invalidateRequest(token: string): Promise<boolean> {
    return Boolean(await registrationRequest.findOneAndUpdate({ token }, { used: true }, { new: true }));
  }

  static generateUniqueToken(): string {
    return nanoid(34);
  }
}
