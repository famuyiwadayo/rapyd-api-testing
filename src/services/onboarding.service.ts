import { RoleService } from "../services";
import {
  Account,
  account,
  ApplicationStatusEnum,
  AvailableResource,
  AvailableRole,
  onboarding,
  Onboarding,
  PaymentItem,
  paymentItem,
  PaymentMethod,
  TransactionReference,
  VerificationStatus,
  verificationStatus,
} from "../entities";
import { PaystackChargeStatus, PermissionScope, TransactionReason } from "../valueObjects";
import { createError, getUpdateOptions, paginate, removeForcedInputs, validateFields } from "../utils";

import { BiodataDto, DocumentUploadDto, AddGuarantorsDto } from "../interfaces/dtos";

import merge from "lodash/merge";
import { DeclineApplicationDto, HirePurchaseContractDto, UpdateApplicationStatusDto } from "../interfaces/dtos/onboarding.dto";
import AuthVerificationService from "./authVerification.service";
import { IPaginationFilter, IPaystackInitTransactionResponse, PaginatedDocument } from "../interfaces/ros";
import PaymentService from "./payment.service";
import config from "../config";
import VehicleService from "./vehicle.service";
import VerifyMeService from "./verifyMe.service";
import GuarantorService from "./guarantor.service";
import { RapydBus } from "../libs";
import { OnboardingEventListener } from "../listerners";
import { EVerificationStatus } from "../entities/verificationStatus";
import { isMatch } from "date-fns";

type CreateOnboardingDataKeys = keyof Onboarding;

export default class OnboardingService {
  async getCurrentDriverOnboardingInfo(accountId: string, roles: string[], dryRun = false): Promise<Onboarding | {}> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const data = await onboarding.findOne({ account: accountId }).lean<Onboarding>().exec();

    if (!dryRun && !data) throw createError("Application not found", 404);
    if (dryRun && !data) return {};

    return data;
  }

  async getApplicationById(id: string, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const data = await onboarding.findById(id).populate("account").lean<Onboarding>().exec();

    if (!data) throw createError("Application not found", 404);
    return data;
  }

  async getAllApplications(
    roles: string[],
    filters: IPaginationFilter & {
      vehicleId?: string;
    } = {
      limit: "10",
      page: "1",
    }
  ): Promise<PaginatedDocument<Onboarding[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    let queries: { $and?: any[] } = {};

    if (filters?.vehicleId) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries?.$and!.push({ "vehicleInfo.vehicle": filters.vehicleId });
    }

    // console.log(JSON.stringify(queries));

    return await paginate("onboarding", queries, filters, {
      populate: ["account"],
      sort: {
        updatedAt: -1,
      },
    });
  }

  async getApplicationStatus(accountId: string, roles: string[], dryRun = false): Promise<{ level1: boolean; level2: boolean } | {}> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    // const data = await onboarding.findOne({ account: accountId }).lean<Onboarding>().exec();
    const verStat = await verificationStatus.findOne({ account: accountId }).lean<VerificationStatus>().exec();

    if (!dryRun && !verStat) throw createError("Application not found", 404);
    if (dryRun && !verStat) return {};

    // const level1 = !!(data?.biodata && data?.documents && data?.guarantorInfo && data?.payment);
    const level1 =
      verStat?.nin?.status === EVerificationStatus.VERIFIED && verStat?.driversLicense?.status === EVerificationStatus.VERIFIED;

    // const level2 =
    //   data?.biodata?.status === ApplicationStatusEnum.VERIFIED &&
    //   data?.documents?.status === ApplicationStatusEnum.VERIFIED &&
    //   data?.guarantorInfo?.status === ApplicationStatusEnum.VERIFIED &&
    //   data?.payment?.status === ApplicationStatusEnum.VERIFIED;

    const level2 = verStat.address?.status === EVerificationStatus.VERIFIED;

    return { level1, level2 };
  }

  async createBiodata(accountId: string, input: BiodataDto, roles: string[]): Promise<Onboarding> {
    validateFields(input, ["personalInfo", "securityQuestions", "nextOfKin", "background"]);
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    if (!isMatch(input.personalInfo.dob as string, "dd-MM-yyyy") || !isMatch(input.nextOfKin.dob as string, "dd-MM-yyyy"))
      throw createError("Date of birth should have the format: dd-mm-yyyy");

    await Promise.all([
      VerifyMeService.checkAndValidateNiN(accountId, input),
      VerifyMeService.checkAndValidateDriversLicense(accountId, input),
    ]);

    const result = await OnboardingService.createOrUpdateData("biodata", accountId, input);
    return result;
  }

  async createDocumentUpload(accountId: string, input: DocumentUploadDto, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData("documents", accountId, input);
    return documents;
  }

  async selectVehicle(
    accountId: string,
    vehicleId: string,
    input: {
      initialDeposit: number;
      duration: number;
    },
    roles: string[]
  ): Promise<Onboarding> {
    validateFields(input, ["duration", "initialDeposit"]);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    if (!(await VehicleService.checkVehicleExists(vehicleId, { isAssigned: false }))) throw createError("Vehicle not found", 404);

    const application = await onboarding
      .findOneAndUpdate(
        { account: accountId },
        {
          vehicleInfo: { vehicle: vehicleId, ...input },
        },
        { new: true }
      )
      .lean<Onboarding>()
      .exec();

    if (!application) throw createError("Application not found", 404);
    return application;

    // return await OnboardingService.createOrUpdateData(
    //   "carSelection",
    //   accountId,
    //   { car: vehicleId }
    // );
  }

  async addGuarantors(accountId: string, input: AddGuarantorsDto, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const data = await onboarding
      .findOneAndUpdate({ account: accountId }, { guarantorInfo: { guarantors: input.guarantors } }, { new: true })
      .lean<Onboarding>()
      .exec();
    if (!data) throw createError("Application not found", 404);
    return data;
  }

  async updateApplicationStatus(accountId: string, input: UpdateApplicationStatusDto, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData("applicationStatus", accountId, input);
    return documents;
  }

  async createHirePurchaseContract(accountId: string, input: HirePurchaseContractDto, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const documents = await OnboardingService.createOrUpdateData("hirePurchaseContract", accountId, input);
    return documents;
  }

  async makePayment(
    accountId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
      method?: PaymentMethod;
      receipt?: string;
    },
    roles: string[]
  ): Promise<(IPaystackInitTransactionResponse | TransactionReference) | Onboarding["payment"]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    const [application, payItem] = await Promise.all([
      await onboarding.findOne({ account: accountId }).lean<Onboarding>().exec(),

      paymentItem.findOne({ for: TransactionReason.ONBOARDING_PAYMENT }).lean<PaymentItem>().exec(),
    ]);

    if (!application) throw createError("Application not found", 404);
    if (application?.payment && application.payment?.paid) return application.payment;

    if (!payItem) throw createError("Onboarding payment item not found, kindly contact the admin", 404);

    const initiatePayment = async () =>
      await OnboardingService.initiateApplicationPayment({ ...input, method: PaymentMethod.ONLINE }, roles, payItem?._id!, accountId);

    if (application?.payment) {
      if (!application.payment?.paid && !application.payment?.txRef) {
        const paymentStatus = await new PaymentService().checkStatus(application.payment?.paymentRef);
        if (paymentStatus.data.status !== PaystackChargeStatus.SUCCESS) return await initiatePayment();
      }

      return (await onboarding.findOne({ account: accountId }).lean<Onboarding>().exec()).payment;
    }

    return await initiatePayment();
  }

  protected static async initiateApplicationPayment(
    // application: Onboarding,
    input: { callbackUrl?: string; inline?: boolean; method?: PaymentMethod; receipt?: string },
    roles: string[],
    itemId: string,
    accountId: string
  ) {
    console.log({ input, roles, itemId, accountId });
    const tx = await new PaymentService().initTransaction(accountId, roles, {
      amount: 0,
      itemId,
      reason: TransactionReason.ONBOARDING_PAYMENT,
      callbackUrl: input?.callbackUrl ?? config.paystackCallbackUrl,
      inline: input?.inline ?? false,
      method: input?.method ?? PaymentMethod.ONLINE,
      receipt: input?.receipt,
    });

    let paymentRef: string = "";
    if (input?.method === PaymentMethod.ONLINE) paymentRef = (tx as IPaystackInitTransactionResponse)?.data?.reference;
    if (input?.method === PaymentMethod.TRANSFER) paymentRef = (tx as TransactionReference)?.reference;

    // console.log("TRANSACTION", paymentRef);

    await OnboardingService.createOrUpdateData("payment", accountId, {
      paymentRef,
      paid: false,
    });

    await RapydBus.emit("application:payment:initiated", { owner: accountId });
    return tx;
  }

  static async markOnboardingFeeAsPaid(accountId: string, refId: string): Promise<Onboarding> {
    const _pay = await OnboardingService.createOrUpdateData("payment", accountId, { txRef: refId, paid: true });
    await RapydBus.emit("application:payment:confirmed", { owner: accountId, txId: refId });
    return _pay;
  }

  protected static async createOrUpdateData<T>(key: CreateOnboardingDataKeys, accountId: string, input: T): Promise<Onboarding> {
    input = removeForcedInputs(input as any, ["status"]);

    // console.log(input);
    let data = await onboarding.findOne({ account: accountId }).select([key, "rapydId"]).lean<Onboarding>().exec();

    const rId = {
      rapydId: !data?.rapydId ? AuthVerificationService.generateCode() : data?.rapydId,
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
    if (!data) throw createError(`Operation failed: unable to create/update ${key}`, 400);
    return data;
  }

  async approveApplication(sub: string, id: string, roles: string[]): Promise<Onboarding> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.ALL]
    );

    let application = await onboarding.findById(id).lean<Onboarding>().exec();
    if (!application) throw createError("Application not found", 404);
    if (application && !application?.payment?.paid) throw createError("Application fee has not been paid", 400);

    if (application.status === ApplicationStatusEnum.VERIFIED) return application;

    application = await onboarding
      .findByIdAndUpdate(id, { status: ApplicationStatusEnum.VERIFIED }, { new: true })
      .lean<Onboarding>()
      .exec();

    await Promise.all([
      account
        .findByIdAndUpdate(
          application?.account,
          {
            isApproved: true,
            phone: application?.biodata?.personalInfo?.phone,
            vehicleInfo: {
              vehicle: application?.vehicleInfo?.vehicle,
              duration: application?.vehicleInfo?.duration,
              deposit: {
                amount: application?.vehicleInfo?.initialDeposit,
                paid: false,
              },
            },
          } as Account,
          { new: true }
        )
        .lean<Account>()
        .exec(),

      VehicleService.assignVehicle(application?.account as string, application?.vehicleInfo?.vehicle as string),
      GuarantorService.addMultipleGuarantor(application?.account as string, application?.guarantorInfo?.guarantors),
      RapydBus.emit("application:approved", { owner: application?.account as string, modifier: sub }),
    ]);

    return application;
  }

  async declineApplication(sub: string, id: string, input: DeclineApplicationDto, roles: string[]): Promise<Onboarding> {
    validateFields(input, ["canReapply", "rejectionReason"]);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.ACCOUNTS_ADMIN, AvailableRole.FLEET_MANAGER],
      roles,
      AvailableResource.ONBOARDING,
      [PermissionScope.ALL]
    );
    const app = await onboarding.findById(id).lean<Onboarding>().exec();

    if (!app) throw createError("Application not found", 404);
    if (app && !app?.payment?.paid) throw createError("Application fee has not been paid", 400);

    const [applic, _] = await Promise.all([
      onboarding
        .findByIdAndUpdate(id, { status: ApplicationStatusEnum.DECLINED, ...input }, { new: true })
        .lean<Onboarding>()
        .exec(),

      RapydBus.emit("application:declined", { owner: app?.account as string, modifier: sub }),
    ]);

    return applic;
  }

  // static async exists(value: any, key = "_id") {
  //   return Boolean()
  // }

  // Typescript will compile this anyways, we don't need to invoke the mountEventListener.
  // When typescript compiles the OnboardingEventListener, the addEvent decorator will be executed.
  static mountEventListener() {
    new OnboardingEventListener();
  }
}
