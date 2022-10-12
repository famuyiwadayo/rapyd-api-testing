import RoleService from "./role.service";
import { PaystackChargeStatus, PermissionScope, TransactionReason } from "../valueObjects";
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
  LoanSpread,
  // loanSpread,
  LoanPaymentStatus,
  loanSpread,
  FinanceStatus,
  PaymentMethod,
  TransactionReference,
} from "../entities";
import {
  GetCurrentUserVehicleFinanceAnalysis,
  GetPeriodicVehicleInstalmentRo,
  IPaginationFilter,
  IPaystackInitTransactionResponse,
  PaginatedDocument,
  // PaginatedDocument,
} from "../interfaces/ros";
import { GetPeriodicVehicleInstalmentDto } from "../interfaces/dtos";
import { createError, getUpdateOptions, paginate, rnd, validateFields } from "../utils";
import { Loan, RapydBus } from "../libs";
import config from "../config";
import AccountService from "./account.service";
import VehicleService from "./vehicle.service";
import PaymentService from "./payment.service";

import consola from "consola";
import { isPast } from "date-fns";
import { clamp, isEmpty } from "lodash";
import LoanService from "./loan.service";

import { FinanceEventListener } from "../listerners";

export default class FinanceService {
  async getCurrentUserSpreads(
    sub: string,
    vehicleId: string,
    roles: string[],
    filters?: IPaginationFilter & { paid?: boolean; status?: string }
  ): Promise<PaginatedDocument<LoanSpread[]>> {
    const statuses = String(filters?.status ?? "").split(",");

    console.log("Statuses", statuses);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.VEHICLE,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const fin = await finance.findOne({ item: vehicleId, account: sub }).lean<Finance>().exec();
    if (!fin) throw createError("Vehicle finance details not found");

    let queries: any = { account: sub, finance: fin?._id };
    if (filters?.paid) {
      queries = { ...queries, paid: filters.paid };
    }
    if (filters?.status) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: statuses.map((status) => ({
          status: { $regex: new RegExp(status, "i") },
        })),
      });
    }

    console.log("Queries", JSON.stringify(queries));

    return await paginate("loanSpread", queries, filters, { sort: { paidOn: "desc" } });
  }

  async getSpreads(
    accountId: string,
    financeId: string,
    roles: string[],
    filters?: IPaginationFilter & { status?: string }
  ): Promise<PaginatedDocument<LoanSpread[]>> {
    const statuses = String(filters?.status ?? "").split(",");
    let queries: { account: string; finance: string; $and?: any[]; $text?: { $search: string } } = {
      account: accountId,
      finance: financeId,
    };

    await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.VEHICLE, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    if (filters?.status) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: statuses.map((status) => ({
          status: { $regex: new RegExp(status, "i") },
        })),
      });
    }

    console.log({ accountId, financeId });

    return await paginate("loanSpread", queries, filters, { sort: { paybackDue: "asc" } });
  }

  async getCurrentUserVechicleFinance(sub: string, vehicleId: string, roles: string[]): Promise<Finance> {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.VEHICLE, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const fin = await finance.findOne({ item: vehicleId, account: sub }).lean<Finance>().exec();
    if (!fin) throw createError("Vehicle finance details not found");
    return fin;
  }

  async getVechicleFinance(accountId: string, roles: string[]): Promise<Finance> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.VEHICLE, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const fin = await finance.findOne({ account: accountId }).lean<Finance>().exec();

    if (!fin) throw createError("Vehicle finance details not found");
    return fin;
  }

  async getFinanceById(financeId: string, roles: string[]): Promise<Finance> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.VEHICLE, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const fin = await finance.findById(financeId).lean<Finance>().exec();

    if (!fin) throw createError("Vehicle finance details not found");
    return fin;
  }

  async getCurrentUserVehicleFinanceAnalysis(
    sub: string,
    vehicleId: string,
    roles: string[]
  ): Promise<GetCurrentUserVehicleFinanceAnalysis> {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.VEHICLE, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const [fin, loan] = await Promise.all([
      finance
        .findOne({
          account: sub,
          category: FinanceCategory.AUTO,
          item: vehicleId,
        })
        .lean<Finance>()
        .exec(),
      LoanService.getActiveLoan(sub),
    ]);

    if (!fin) throw createError("Vehicle finance details not found");

    const total = fin?.principal + fin?.cumulativeInterest + (loan?.amount ?? 0);
    const debt = fin?.remainingDebt;
    const amountPaid = fin?.amountPaid;

    const loanBalance = loan?.balance ?? 0;

    return {
      finance: fin,
      analysis: {
        balance: {
          value: debt,
          percentage: clamp((debt / total) * 100, 0, 100),
        },
        total: {
          value: total,
          percentage: clamp((total / total) * 100, 0, 100),
        },
        amountPaid: {
          value: amountPaid,
          percentage: clamp((amountPaid / total) * 100, 0, 100),
        },
        loanBalance: {
          value: loan?.balance ?? 0,
          percentage: clamp((loanBalance / total) * 100, 0, 100),
        },
      },
    };
  }

  async getPeriodicVehicleInstalment(
    vehicleId: string,
    input: GetPeriodicVehicleInstalmentDto,
    roles: string[],
    dryRun = false
  ): Promise<GetPeriodicVehicleInstalmentRo> {
    validateFields(input, ["initialDeposit", "months"]);
    if (+input.months < 12) throw createError("Can't be less than 12 months");

    if (!dryRun)
      await RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
        roles,
        AvailableResource.VEHICLE,
        [PermissionScope.READ, PermissionScope.ALL]
      );

    const v = await vehicle.findById(vehicleId).lean<Vehicle>().exec();
    if (!v) throw createError("Vehicle not found", 404);

    // const apr = v?.annualPercentageRate ?? config.ANNUAL_PERCENTAGE_RATE;
    const apr = await PaymentService.getAPR(input.months);
    const totalWeeks = (input.months / 12) * 52;

    const weeklyInstalment = new Loan().getPeriodicPayment(v?.price, totalWeeks, apr, input.initialDeposit, "WEEKLY");

    return {
      apr,
      period: "WEEKLY",
      vehiclePrice: v?.price,
      instalment: weeklyInstalment,
      initialDeposit: input.initialDeposit,
      pricePlusInterest: rnd(weeklyInstalment * totalWeeks),
      totalInterest: rnd(weeklyInstalment * totalWeeks - (v?.price - input.initialDeposit)),
    };
  }

  async makeInitialVehicleDeposit(
    accountId: string,
    vehicleId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
      initialDeposit: number;
      method?: PaymentMethod;
      receipt?: string;
    },
    roles: string[]
  ): Promise<(IPaystackInitTransactionResponse | TransactionReference) | Finance> {
    // validateFields(input, ["initialDeposit"]);

    input.method = input?.method ?? PaymentMethod.ONLINE;

    const checks = await Promise.all([
      AccountService.checkAccountExists(accountId),
      VehicleService.checkVehicleExists(vehicleId),
      RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.DRIVER], roles, AvailableResource.VEHICLE, [
        PermissionScope.READ,
        PermissionScope.ALL,
      ]),
    ]);

    if (checks && !checks[0]) throw createError("Account not found", 404);
    if (checks && !checks[1]) throw createError("Vehicle not found", 404);

    const fin = await finance.findOne({ account: accountId, item: vehicleId }).populate("item").lean<Finance>().exec();

    const initiatePayment = async () => await FinanceService._makeInitialDeposit(accountId, vehicleId, input, roles);

    if (fin) {
      if (!fin?.initialDepositPaid && !!fin?.initialDepositPaymentRef) {
        console.log({ initialDepositPaid: fin?.initialDepositPaid, initialDepositPaymentRef: fin?.initialDepositPaymentRef });
        const paymentStatus = await new PaymentService().checkStatus(fin?.initialDepositPaymentRef);
        if (paymentStatus.data.status !== PaystackChargeStatus.SUCCESS) return await initiatePayment();
      }
      if (!fin?.initialDepositPaid && isEmpty(fin?.initialDepositPaymentRef ?? "")) {
        return await initiatePayment();
      }

      return fin;
    }

    return await initiatePayment();
  }

  protected static async _makeInitialDeposit(
    accountId: string,
    vehicleId: string,
    input: {
      callbackUrl: string;
      inline: boolean;
      method?: PaymentMethod;
      receipt?: string;
    },
    roles: string[]
  ): Promise<IPaystackInitTransactionResponse | TransactionReference> {
    const acc = await account.findById(accountId).select("vehicleInfo").lean<Account>().exec();
    if (acc && !acc?.vehicleInfo) throw createError(`Vehicle info not found`, 404);

    const inst = await new FinanceService().getPeriodicVehicleInstalment(
      acc?.vehicleInfo?.vehicle as string,
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
          duration: acc?.vehicleInfo?.duration,
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
      method: input?.method ?? PaymentMethod.ONLINE,
      receipt: input?.receipt,
    });

    let initialDepositPaymentRef: string = "";
    if (input?.method === PaymentMethod.ONLINE) initialDepositPaymentRef = (tx as IPaystackInitTransactionResponse)?.data?.reference;
    if (input?.method === PaymentMethod.TRANSFER) initialDepositPaymentRef = (tx as TransactionReference)?.reference;

    await finance
      .findByIdAndUpdate(fin?._id, {
        initialDepositPaymentRef,
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

    const remainingDebt = +fin?.totalSumWithInterest;

    // await FinanceService.spreadVehicleFinances(acc?._id!, remainingDebt, fin);

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
            remainingDebt,
          },
          { new: true }
        )
        .lean<Finance>()
        .exec(),
      FinanceService.spreadVehicleFinances(acc?._id!, remainingDebt, fin),
      RapydBus.emit("finance:initialPayment", { account: accountId, amount: fin?.initialDeposit }),
    ]);
  }

  private static async spreadVehicleFinances(accountId: string, debt: number, fin: Finance) {
    if (!fin || !debt) return;
    const apr = fin?.apr ?? config.ANNUAL_PERCENTAGE_RATE;
    const totalWeeks = (fin?.duration / 12) * 52;
    const calc = new Loan().calc(debt, totalWeeks, apr, 0, "WEEKLY");

    const spreads = calc?.installments?.map(
      (inst) =>
        ({
          account: accountId,
          finance: fin?._id as string,
          instalment: fin?.instalment,
          instalmentId: inst?.instalmentId,
          nextInstalmentId: inst?.nextInstalmentId,
          prevInstalmentId: inst?.prevInstalmentId,
          isOverdue: false,
          paybackDue: inst?.paybackDate,
          status: LoanPaymentStatus.PENDING,
        } as LoanSpread)
    );

    const nextSpread = spreads[0];

    await Promise.all([
      loanSpread.insertMany([...spreads], { lean: true }),
      finance
        .findByIdAndUpdate(
          fin?._id,
          {
            prevInstalmentId: nextSpread?.prevInstalmentId,
            nextInstalmentId: nextSpread?.instalmentId,
          },
          { new: true }
        )
        .lean()
        .exec(),
    ]);

    console.log("FINANCE SPREADS", accountId, spreads);
  }

  public static async checkFianceBeforePaymentUpdate(financeId: string, amount: number) {
    const fin = await finance.findById(financeId).lean<Finance>().exec();

    if (!fin) throw createError("Vehicle finance details not found", 404);

    const debt = Math.ceil(fin?.remainingDebt ?? 0);

    if (debt === 0) {
      if (fin?.status && fin?.status !== FinanceStatus.PAID)
        await finance.findByIdAndUpdate(financeId, { status: FinanceStatus.PAID }).lean().exec();
      throw createError("Vehicle finance has been fully paid", 400);
    }

    if (amount > debt) throw createError(`Amount is larger than vehicle finance debt: N${Number(debt).toLocaleString()}`, 400);

    return;
  }

  private static async updateSpread(
    spread: LoanSpread,
    amount: number,
    txRef: string,
    method: PaymentMethod,
    debt: number,
    index = 1
  ) {
    let toRun: any = [];
    let nextInstalmentId: string = "";
    let prevInstalmentId: string = "";

    if (!spread) return;

    const isPaymentSufficient = amount >= spread.instalment || amount >= spread.instalment - spread.amountPaid;

    let spreadAmt = amount >= spread.instalment ? spread.instalment : amount;
    let rDebt = amount >= spread.instalment ? debt - spread.instalment * (index + 1) : debt - spread.instalment * index - amount;

    // if (spread?.amountPaid < spread?.instalment)
    //   spreadAmt = spread?.instalment - spread?.amountPaid;

    const updates: any = {
      txRef,
      paymentMethod: method,
      debt: clamp(rDebt, 0, debt),
      $inc: { amountPaid: spreadAmt },
    };

    if (isPaymentSufficient) {
      Object.assign(updates, {
        paidOn: new Date(),
        status: LoanPaymentStatus.CONFIRMED,
        paid: true,
        isOverdue: isPast(spread.paybackDue),
      });

      nextInstalmentId = spread.nextInstalmentId;
      prevInstalmentId = spread.instalmentId;
    }

    if (!isPaymentSufficient) {
      Object.assign(updates, {
        paid: false,
        partPaidOn: new Date(),
        status: LoanPaymentStatus.PART_PAID,
        isOverdue: isPast(spread.paybackDue),
      });

      nextInstalmentId = spread.instalmentId;
      prevInstalmentId = spread.prevInstalmentId;
    }

    toRun = [loanSpread.findByIdAndUpdate(spread?._id, updates, { new: true }).lean<LoanSpread>().exec()];

    /**
     * if the spread is the last to update | the update amount is less
     * than the spread instalment, then set the next and prev instalment
     * on the finance document for references later on.
     * */

    if (amount <= spread.instalment) {
      toRun = [
        ...toRun,
        finance.findByIdAndUpdate(
          spread?.finance,
          {
            nextInstalmentId,
            prevInstalmentId,
          },
          { new: true }
        ),
      ];
    }

    const res = await Promise.all(toRun);
    spread = res[0];
    // console.log("Spread", spread, { amount, index, rDebt, debt });

    return res;
  }

  private static async checkSpreadPaidInPart(
    fin: Finance,
    amount: number,
    txRef: string,
    method: PaymentMethod,
    debt: number
  ): Promise<{ amount: number; debt: number }> {
    let spread = await loanSpread
      .findOne({
        account: fin?.account,
        finance: fin?._id,
        paid: false,
        amountPaid: { $lt: fin?.instalment },
        status: LoanPaymentStatus.PART_PAID,
      })
      .sort({ paybackDue: "asc" })
      .lean<LoanSpread>()
      .exec();

    if (!spread) return { amount, debt };

    const remainingPartAmount = spread?.instalment - spread?.amountPaid;
    const remainingDebt = debt - remainingPartAmount;

    spread = await loanSpread
      .findByIdAndUpdate(
        spread._id,
        {
          $inc: { amountPaid: remainingPartAmount },
          debt: clamp(remainingDebt, 0, debt),
          paidOn: new Date(),
          status: LoanPaymentStatus.CONFIRMED,
          paid: true,
          isOverdue: isPast(spread.paybackDue),
          txRef,
          paymentMethod: method,
        },
        { new: true }
      )
      .lean<LoanSpread>()
      .exec();

    // console.log("SPREAD PAID IN PART", spread);

    return { amount: amount - remainingPartAmount, debt: remainingDebt };
  }

  private static async processSpreadUpdates(fin: Finance, amount: number, txRef: string, method: PaymentMethod, debt: number) {
    const toRun: any = [];

    if (amount > fin?.instalment) {
      const { amount: rAmt, debt: rDebt } = await FinanceService.checkSpreadPaidInPart(fin, amount, txRef, method, debt);
      // determine how many loanSpread can we get in the amount
      const spreadsLimit = Math.ceil(rAmt / Math.floor(fin?.instalment));
      let spreads = await loanSpread
        .find({
          account: fin?.account,
          finance: fin?._id,
          paid: false,
          amountPaid: { $lt: fin?.instalment },
        })
        .sort({ paybackDue: "asc" })
        .limit(spreadsLimit)
        .lean<LoanSpread[]>()
        .exec();

      // console.log("SPREADS ", spreads, spreadsLimit, amount);

      spreads.forEach((spread, i) => {
        toRun.push(FinanceService.updateSpread(spread, rAmt - fin?.instalment * i, txRef, method, rDebt, i));
      });
    } else {
      const spread = await loanSpread
        .findOne({
          account: fin?.account,
          finance: fin?._id,
          category: FinanceCategory.AUTO,
          instalmentId: fin?.nextInstalmentId,
        })
        .lean<LoanSpread>()
        .exec();

      // console.log("Single Spread Update", spread, amount);
      if (spread && spread?.status !== LoanPaymentStatus.CONFIRMED)
        toRun.push(FinanceService.updateSpread(spread, amount, txRef, method, debt));
    }

    if (toRun && toRun.length > 0) await Promise.all(toRun);
    return;
  }

  public static async updatePayback(financeId: string, account: string, amount: number, txRef: string, method: PaymentMethod) {
    console.log({ financeId, account, amount, txRef, method });

    const updates = {
      $inc: { amountPaid: amount, remainingDebt: -clamp(amount, 0, amount) },
    };

    const fin = await finance
      .findOne({ _id: financeId, account, remainingDebt: { $gt: 0 } })
      .lean<Finance>()
      .exec();

    if (!fin)
      consola.error("Vehicle finance payment update failed, finance not found", {
        financeId,
        amount,
        txRef,
      });

    if (fin?.remainingDebt - amount === 0) Object.assign(updates, { status: FinanceStatus.PAID });

    return await Promise.all([
      FinanceService.processSpreadUpdates(fin, amount, txRef, method, fin?.remainingDebt),
      finance.findByIdAndUpdate(fin?._id, updates, { new: true }).lean<Loan>().exec(),
      RapydBus.emit("finance:weeklyPayment", { account, amount }),
    ]);
  }

  // Typescript will compile this anyways, we don't need to invoke the mountEventListener.
  // When typescript compiles the AccountEventListener, the addEvent decorator will be executed.
  static mountEventListener() {
    new FinanceEventListener();
  }
}

// /payment-details/refId~vechicleId

// CALL: `/transactions/:refId`
// CALL: `/finances/vehicles/:vechicleId`

// - after getting the data from `/finances/vehicles/:vechicleId`
// CALL: `/finances/:financeId/spreads/:accountId`
