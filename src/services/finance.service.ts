import RoleService from "./role.service";
import { PermissionScope, TransactionReason } from "../valueObjects";
import {
  vehicle,
  Vehicle,
  AvailableResource,
  AvailableRole,
  //   Finance,
  finance,
  FinanceCategory,
  account,
  Account,
  Finance,
} from "../entities";
import {
  GetPeriodicVehicleInstalmentRo,
  IPaystackInitTransactionResponse,
} from "../interfaces/ros";
import { GetPeriodicVehicleInstalmentDto } from "../interfaces/dtos";
import { createError, getUpdateOptions, rnd, validateFields } from "../utils";
import { Loan } from "../libs";
import config from "../config";
import AccountService from "./account.service";
import VehicleService from "./vehicle.service";
import PaymentService from "./payment.service";

export default class FinanceService {
  async getPeriodicVehicleInstalment(
    vehicleId: string,
    input: GetPeriodicVehicleInstalmentDto,
    roles: string[],
    dryRun = false
  ): Promise<GetPeriodicVehicleInstalmentRo> {
    validateFields(input, ["initialDeposit", "months"]);
    if (+input.months < 24)
      throw createError("Months can't be less than 24 months");

    if (!dryRun)
      await RoleService.requiresPermission(
        [
          AvailableRole.SUPERADMIN,
          AvailableRole.DRIVER,
          AvailableRole.MODERATOR,
        ],
        roles,
        AvailableResource.VEHICLE,
        [PermissionScope.READ, PermissionScope.ALL]
      );

    const v = await vehicle.findById(vehicleId).lean<Vehicle>().exec();
    if (!v) throw createError("Vehicle not found", 404);

    const apr = v?.annualPercentageRate ?? config.ANNUAL_PERCENTAGE_RATE;
    const totalWeeks = (input.months / 12) * 52;

    const weeklyInstalment = new Loan().getPeriodicPayment(
      v?.price,
      totalWeeks,
      apr,
      input.initialDeposit,
      "WEEKLY"
    );

    return {
      apr,
      period: "WEEKLY",
      vehiclePrice: v?.price,
      instalment: weeklyInstalment,
      initialDeposit: input.initialDeposit,
      pricePlusInterest: rnd(weeklyInstalment * totalWeeks),
      totalInterest: rnd(
        weeklyInstalment * totalWeeks - (v?.price - input.initialDeposit)
      ),
    };
  }

  async makeInitialVehicleDeposit(
    accountId: string,
    vehicleId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
      initialDeposit: number;
    },
    roles: string[]
  ): Promise<IPaystackInitTransactionResponse | Finance> {
    // validateFields(input, ["initialDeposit"]);

    const checks = await Promise.all([
      AccountService.checkAccountExists(accountId),
      VehicleService.checkVehicleExists(vehicleId),
      RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN, AvailableRole.DRIVER],
        roles,
        AvailableResource.VEHICLE,
        [PermissionScope.READ, PermissionScope.ALL]
      ),
    ]);

    if (checks && !checks[0]) throw createError("Account not found", 200);
    if (checks && !checks[1]) throw createError("Vehicle not found", 200);

    const fin = await finance
      .findOne({ account: accountId, item: vehicleId })
      .populate("item")
      .lean<Finance>()
      .exec();

    if (fin) {
      if (!fin?.initialDepositPaid && fin?.initialDepositPaymentRef)
        await new PaymentService().checkStatus(fin?.initialDepositPaymentRef);
      return fin;
    }

    return await FinanceService._makeInitialDeposit(
      accountId,
      vehicleId,
      input,
      roles
    );
  }

  protected static async _makeInitialDeposit(
    accountId: string,
    vehicleId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
    },
    roles: string[]
  ): Promise<IPaystackInitTransactionResponse> {
    const acc = await account
      .findById(accountId)
      .select("vehicleInfo")
      .lean<Account>()
      .exec();
    if (acc && !acc?.vehicleInfo)
      throw createError(`Vehicle info not found`, 404);

    const inst = await new FinanceService().getPeriodicVehicleInstalment(
      vehicleId,
      {
        ...input,
        months: acc?.vehicleInfo?.duration,
        initialDeposit: acc?.vehicleInfo?.deposit?.amount,
      },
      roles,
      true
    );

    const fin = await finance
      .findOneAndUpdate(
        { account: accountId },
        {
          apr: inst?.apr,
          account: accountId,
          category: FinanceCategory.AUTO,
          item: vehicleId,
          onModel: "Vehicle",
          principal: inst?.vehiclePrice,
          cumulativeInterest: inst?.totalInterest,
          instalment: inst?.instalment,
          period: "WEEKLY",
          initialDeposit: acc?.vehicleInfo?.deposit?.amount,
          totalSumWithInterest: inst?.pricePlusInterest,
        },
        getUpdateOptions()
      )
      .lean<Finance>()
      .exec();

    const tx = await new PaymentService().initTransaction(accountId, roles, {
      amount: acc?.vehicleInfo?.deposit?.amount,
      itemId: fin?._id!,
      reason: TransactionReason.AUTO_DEPOSIT,
      callbackUrl: input.callbackUrl ?? config.paystackCallbackUrl,
      inline: input.inline ?? false,
    });

    await finance
      .findByIdAndUpdate(fin?._id, {
        initialDepositPaymentRef: tx?.data?.reference,
      })
      .lean<Finance>()
      .exec();

    return tx;
  }

  static async markInitialDepositAsPaid(financeId: string, accountId: string) {
    const [fin, acc] = await Promise.all([
      finance.findById(financeId).lean<Finance>().exec(),
      account.findById(accountId).lean<Account>().exec(),
    ]);

    if (!fin) throw createError("Vehicle finance details not found", 404);
    if (!acc) throw createError("Account not found", 404);

    await Promise.all([
      account
        .findByIdAndUpdate(
          accountId,
          {
            vehicleInfo: {
              ...acc?.vehicleInfo,
              deposit: { ...acc?.vehicleInfo?.deposit, paid: true },
            },
          },
          { new: true }
        )
        .lean<Account>(),
      finance
        .findByIdAndUpdate(
          financeId,
          {
            initialDepositPaid: true,
            amountPaid: fin?.initialDeposit,
            remainingDebt: +fin?.totalSumWithInterest - +fin?.initialDeposit,
          },
          { new: true }
        )
        .lean<Finance>()
        .exec(),
    ]);
  }
}
