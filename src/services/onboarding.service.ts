import { RoleService } from "../services";
import {
  AvailableResource,
  AvailableRole,
  onboarding,
  Onboarding,
} from "../entities";
import { PermissionScope } from "../valueObjects";
import { createError, getUpdateOptions } from "../utils";

import { BiodataDto, DocumentUploadDto } from "../interfaces/dtos";

import merge from "lodash/merge";

type CreateOnboardingDataKeys = keyof Onboarding;

export default class OnboardingService {
  async getDriverOnboardingInfo(
    accountId: string,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const data = await onboarding
      .findOne({ account: accountId })
      .lean<Onboarding>()
      .exec();
    if (!data) throw createError("Driver onboarding record not found", 404);
    return data;
  }

  async createBiodata(
    accountId: string,
    input: BiodataDto,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const biodata = await OnboardingService.createOrUpdateData(
      "biodata",
      accountId,
      input
    );
    return biodata;
  }

  async createDocumentUpload(
    accountId: string,
    input: DocumentUploadDto,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData(
      "documents",
      accountId,
      input
    );
    return documents;
  }

  protected static async createOrUpdateData<T>(
    key: CreateOnboardingDataKeys,
    accountId: string,
    input: T
  ): Promise<Onboarding> {
    let biodata = await onboarding
      .findOne({ account: accountId })
      .select(key)
      .lean<Onboarding>()
      .exec();

    console.log("Biodata", merge(biodata?.biodata, input));
    biodata = await onboarding
      .findOneAndUpdate(
        { account: accountId },
        { account: accountId, [key]: merge(biodata?.biodata, input) },
        getUpdateOptions()
      )
      .lean<Onboarding>()
      .exec();
    if (!biodata)
      throw createError(`Operation failed: unable to update ${key}`, 400);
    return biodata;
  }
}
