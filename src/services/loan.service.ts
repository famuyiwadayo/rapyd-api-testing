import { addDays } from "date-fns";
import { PermissionScope } from "../valueObjects";
import {
  Loan,
  AvailableRole,
  AvailableResource,
  loan,
  LoanStatus,
} from "../entities";
import RoleService from "./role.service";
import { RequestLoanDto } from "../interfaces/dtos";
import {
  createError,
  paginate,
  removeForcedInputs,
  validateFields,
} from "../utils";
import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";
import AccessService from "./access.service";

import consola from "consola";

export default class LoanService {
  async getLoans(
    sub: string,
    roles: string[],
    filters: IPaginationFilter & {
      status?: string[];
      searchPhrase?: string;
    }
  ): Promise<PaginatedDocument<Loan[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.DRIVER, AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.LOAN,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const statuses = String(filters?.status ?? "").split(",");

    let queries: {
      $and?: any[];
      $text?: { $search: string };
      account?: string;
    } = {};

    if (filters?.status) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({ $or: statuses.map((status) => ({ status })) });
    }

    if (filters?.searchPhrase) {
      queries.$text = { $search: filters.searchPhrase };
    }

    // if user isn't an admin return his own loan history.
    if (
      !(await RoleService.hasOneOrMore(
        [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
        roles
      ))
    )
      Object.assign(queries, { account: sub });

    console.log("GET LOANS", JSON.stringify(queries));

    return await paginate("loan", queries, filters, {
      populate: ["account"],
    });
  }

  async getLoanById(
    sub: string,
    loanId: string,
    roles: string[]
  ): Promise<Loan> {
    await RoleService.requiresPermission(
      [AvailableRole.DRIVER, AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.LOAN,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    let query: { _id: string; account?: string } = { _id: loanId };

    const isAdmin = await RoleService.hasOneOrMore(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles
    );

    if (
      !isAdmin &&
      (await AccessService.documentBelongsToAccount(sub, loanId, "loan"))
    )
      Object.assign(query, { accound: sub });

    const l = await loan.findOne(query).lean<Loan>().exec();
    if (!l) throw createError("Loan not found", 404);
    return l;
  }

  // async checkEligibility(sub: string, roles: stirng[]): Promise<{isEligible: boolean; minRange: number, maxRange: number}> {
  //   await RoleService.requiresPermission(
  //     [AvailableRole.DRIVER],
  //     roles,
  //     AvailableResource.LOAN,
  //     [PermissionScope.REQUEST, PermissionScope.ALL]
  //   );

  // }

  async requestLoan(
    sub: string,
    input: RequestLoanDto,
    roles: string[]
  ): Promise<Loan> {
    input = removeForcedInputs(input as Loan, [
      "_id",
      "createdAt",
      "updatedAt",
      "account",
      "status",
      "paybackDate",
    ]);
    validateFields(input, ["amount", "duration"]);
    await RoleService.requiresPermission(
      [AvailableRole.DRIVER],
      roles,
      AvailableResource.LOAN,
      [PermissionScope.REQUEST, PermissionScope.ALL]
    );

    if (await LoanService.checkHasALoan(sub))
      throw createError("You already have a pending/active loan", 400);

    const paybackDate = addDays(new Date(), parseInt(input.duration as string));
    return await loan.create({
      ...input,
      account: sub,
      paybackDate,
      balance: input.amount,
      amountPaid: 0,
    });
  }

  async approveLoan(id: string, roles: string[]): Promise<Loan> {
    return await LoanService.updateLoanStatus(id, roles, LoanStatus.APPROVED);
  }

  async declineLoan(id: string, roles: string[]): Promise<Loan> {
    return await LoanService.updateLoanStatus(id, roles, LoanStatus.DECLINED);
  }

  static async checkHasALoan(sub: string): Promise<boolean> {
    const count = await loan
      .countDocuments({
        account: sub,
        status: { $in: [LoanStatus.PENDING, LoanStatus.APPROVED] },
      })
      .exec();
    return count > 0;
  }

  static async checkLoanExist(loanId: string): Promise<boolean> {
    const count = await loan.countDocuments({ _id: loanId }).exec();
    return count > 0;
  }

  static async updateLoanStatus(
    loanId: string,
    roles: string[],
    status: LoanStatus
  ): Promise<Loan> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR],
      roles,
      AvailableResource.LOAN,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const l = await loan
      .findOneAndUpdate(
        {
          _id: loanId,
          // don't allow admin to update an approved or paid loan
          status: { $in: [LoanStatus.PENDING, LoanStatus.DECLINED] },
        },
        { status },
        { new: true }
      )
      .lean<Loan>()
      .exec();
    if (!l) throw createError("Loan not found", 404);

    return l;
  }

  static async checkLoanBeforePaymentUpdate(loanId: string, amount: number) {
    const l = await loan.findById(loanId).lean<Loan>().exec();

    if (!l) throw createError("Loan not found", 404);

    if (l.status === LoanStatus.PENDING)
      throw createError("Loan as not been approved", 401);
    if (l.status === LoanStatus.DECLINED)
      throw createError("Loan as been rejected", 401);

    if (l.balance === 0) {
      if (l.status !== LoanStatus.PAID)
        await loan
          .findByIdAndUpdate(loanId, { status: LoanStatus.PAID })
          .lean()
          .exec();
      throw createError("Loan has been fully paid", 400);
    }

    if (amount > l.balance)
      throw createError("Amount is larger than loan balance", 400);
  }

  static async updatePayback(
    loanId: string,
    account: string,
    amount: number,
    txRef: string
  ) {
    const updates = {
      $push: { txRefs: txRef },
      $inc: { amountPaid: amount, balance: -amount },
    };

    const l = await loan
      .findOne({ _id: loanId, account, balance: { $gt: 0 } })
      .lean<Loan>()
      .exec();

    if (!l)
      consola.error("Loan payment update failed, loan not found", {
        loanId,
        amount,
        txRef,
      });

    if (l.balance - amount === 0)
      Object.assign(updates, { status: LoanStatus.PAID });

    console.log(updates);

    return await loan
      .findByIdAndUpdate(l._id, updates, { new: true })
      .lean<Loan>()
      .exec();
  }
}
