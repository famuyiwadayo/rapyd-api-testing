import { RoleService } from "../services";
import {
  AvailableResource,
  AvailableRole,
  onboarding,
  Onboarding,
  PaymentItem,
  paymentItem,
} from "../entities";
import { PermissionScope, TransactionReason } from "../valueObjects";
import { createError, getUpdateOptions } from "../utils";

import {
  BiodataDto,
  DocumentUploadDto,
  AddGuarantorsDto,
} from "../interfaces/dtos";

import merge from "lodash/merge";
import {
  HirePurchaseContractDto,
  UpdateApplicationStatusDto,
} from "../interfaces/dtos/onboarding.dto";
import AuthVerificationService from "./authVerification.service";
import { IPaystackInitTransactionResponse } from "../interfaces/ros";
import PaymentService from "./payment.service";
import config from "../config";

type CreateOnboardingDataKeys = keyof Onboarding;

export default class OnboardingService {
  async getDriverOnboardingInfo(
    accountId: string,
    roles: string[],
    dryRun = false
  ): Promise<Onboarding | {}> {
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

    if (!dryRun && !data) throw createError("Application not found", 404);
    if (dryRun && !data) return {};

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

    const result = await OnboardingService.createOrUpdateData(
      "biodata",
      accountId,
      input
    );
    return result;
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

  async addGuarantors(
    accountId: string,
    input: AddGuarantorsDto,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const data = await onboarding
      .findOneAndUpdate(
        { account: accountId },
        { guarantors: input.guarantors },
        { new: true }
      )
      .lean<Onboarding>()
      .exec();
    if (!data) throw createError("Application not found", 404);
    return data;
  }

  async updateApplicationStatus(
    accountId: string,
    input: UpdateApplicationStatusDto,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData(
      "applicationStatus",
      accountId,
      input
    );
    return documents;
  }

  async createHirePurchaseContract(
    accountId: string,
    input: HirePurchaseContractDto,
    roles: string[]
  ): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData(
      "hirePurchaseContract",
      accountId,
      input
    );
    return documents;
  }

  async makePayment(
    accountId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
    },
    roles: string[]
  ): Promise<IPaystackInitTransactionResponse | Onboarding["payment"]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    const [application, payItem] = await Promise.all([
      await onboarding
        .findOne({ account: accountId })
        .lean<Onboarding>()
        .exec(),

      paymentItem
        .findOne({ for: TransactionReason.ONBOARDING_PAYMENT })
        .lean<PaymentItem>()
        .exec(),
    ]);

    if (!application) throw createError("Application not found", 404);
    if (application?.payment && application.payment?.paid)
      return application.payment;

    if (!payItem)
      throw createError(
        "Onboarding payment item not found, kindly contact the admin",
        404
      );

    return await new PaymentService().initTransaction(accountId, roles, {
      amount: 0,
      itemId: payItem._id!,
      reason: TransactionReason.ONBOARDING_PAYMENT,
      callbackUrl: input.callbackUrl ?? config.paystackCallbackUrl,
      inline: input.inline ?? false,
    });
  }

  static async markOnboardingFeeAsPaid(
    accountId: string,
    refId: string
  ): Promise<Onboarding> {
    const _pay = await OnboardingService.createOrUpdateData(
      "payment",
      accountId,
      { txRef: refId, paid: true }
    );
    return _pay;
  }

  protected static async createOrUpdateData<T>(
    key: CreateOnboardingDataKeys,
    accountId: string,
    input: T
  ): Promise<Onboarding> {
    let data = await onboarding
      .findOne({ account: accountId })
      .select([key, "rapydId"])
      .lean<Onboarding>()
      .exec();

    const rId = {
      rapydId: !data?.rapydId
        ? AuthVerificationService.generateCode()
        : data?.rapydId,
    };

    data = await onboarding
      .findOneAndUpdate(
        { account: accountId },
        {
          account: accountId,
          [key]: merge((data ?? {})[key] ?? {}, input),
          ...rId,
        },
        getUpdateOptions()
      )
      .lean<Onboarding>()
      .exec();
    if (!data)
      throw createError(
        `Operation failed: unable to create/update ${key}`,
        400
      );
    return data;
  }
}
