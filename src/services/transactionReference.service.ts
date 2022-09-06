import { generate } from "voucher-code-generator";

import RoleService from "./role.service";
import { PaginatedDocument, IPaginationFilter } from "../interfaces/ros";
import { PermissionScope, TransactionReason } from "../valueObjects";
import { createError, getUpdateOptions, paginate, stripUpdateFields } from "../utils";
import {
  AvailableResource,
  AvailableRole,
  PaymentMethod,
  transactionReference,
  TransactionReference,
  TransactionReferenceStatus,
} from "../entities";

export default class TransactionReferenceService {
  public async getTransactionReferences(
    roles: string[],
    filters: IPaginationFilter & { paid?: boolean; reason?: TransactionReason }
  ): Promise<PaginatedDocument<TransactionReference[]>> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.ACCOUNTS_ADMIN],
      roles,
      AvailableResource.HISTORY,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    console.log("Transaction references", "reading from txRefs");

    const reasons = String(filters?.reason ?? "").split(",");

    let queries: { $and?: any[]; $text?: { $search: string } } = {};
    if (filters?.paid) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({ used: filters?.paid });
    }
    if (filters?.reason) {
      queries = { $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: reasons.map((reason) => ({ reason })),
      });
    }

    return await paginate("transactionReference", queries, filters, {
      populate: ["account"],
      sort: { updatedAt: -1 },
    });
  }

  public async getDriverTransactionReferences(
    sub: string,
    roles: string[],
    filters: IPaginationFilter & { reason?: TransactionReason; status?: TransactionReferenceStatus }
  ): Promise<PaginatedDocument<TransactionReference[]>> {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.HISTORY, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const reasons = String(filters?.reason ?? "").split(",");
    const statuses = String(filters?.status ?? "").split(",");

    let queries: { account: string; $and?: any[]; $text?: { $search: string } } = { account: sub };
    // if (filters?.paid) {
    //   queries = { $and: [...(queries?.$and ?? [])] };
    //   queries.$and!.push({ used: filters?.paid });
    // }
    if (filters?.reason) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: reasons.map((reason) => ({ reason })),
      });
    }
    if (filters?.status) {
      queries = { ...queries, $and: [...(queries?.$and ?? [])] };
      queries.$and!.push({
        $or: statuses.map((status) => ({ status })),
      });
    }

    return await paginate("transactionReference", queries, filters, { sort: { updatedAt: -1 } });
  }

  public async getDriverTransactionReferenceByRef(sub: string, ref: string, roles: string[]) {
    await RoleService.requiresPermission([AvailableRole.DRIVER], roles, AvailableResource.HISTORY, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

    const result = await transactionReference.findOne({ reference: ref, account: sub }).lean<TransactionReference>().exec();
    if (!result) throw createError("Transaction not found", 404);

    return result;
  }

  public async addTransactionReference(
    accountId: string,
    amount: number,
    roles: string[],
    reason: TransactionReason,
    itemId?: string,
    options?: {
      txNew?: boolean;
      method?: PaymentMethod;
      proof?: string;
      saveCard?: boolean;
      reference?: string;
    }
  ): Promise<TransactionReference> {
    const reference = options?.reference ?? TransactionReferenceService.generateReferenceNumber();

    if (options?.txNew)
      return await transactionReference.create({
        amount,
        account: accountId,
        itemId,
        roles,
        reason,
        reference,
        saveCard: options?.saveCard ?? false,
        used: false,
        paymentMethod: options?.method ?? PaymentMethod.ONLINE,
        bankTransferProof: options?.proof,
      });

    return await transactionReference
      .findOneAndUpdate(
        { account: accountId, reason, itemId },
        {
          amount,
          account: accountId,
          itemId,
          roles,
          reason,
          reference,
          saveCard: options?.saveCard ?? false,
          paymentMethod: options?.method ?? PaymentMethod.ONLINE,
          bankTransferProof: options?.proof,
          used: false,
        },
        getUpdateOptions()
      )
      .lean<TransactionReference>()
      .exec();
  }

  public async updateTransactionReference(reference: string, body: Partial<TransactionReference>): Promise<TransactionReference> {
    stripUpdateFields(body);
    return await transactionReference.findOneAndUpdate({ reference }, body, { new: true }).lean<TransactionReference>().exec();
  }

  public async getTransactionReference(
    reference: string,
    validate = true,
    roles?: string[],
    authenticate = false
  ): Promise<TransactionReference> {
    if (roles && authenticate)
      await RoleService.requiresPermission(
        [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.ACCOUNTS_ADMIN],
        roles,
        AvailableResource.HISTORY,
        [PermissionScope.READ, PermissionScope.ALL]
      );

    let txRef = transactionReference.findOne({ reference }).populate("account").lean<TransactionReference>().exec();

    if (!txRef && validate) throw createError(`Transaction reference not found`, 400);
    return txRef;
  }

  public async markReferenceUsed(reference: string, used: boolean): Promise<TransactionReference> {
    await transactionReference.findOneAndUpdate({ reference }, { used }).exec();
    console.log(">>>>Marking reference used");
    return await this.getTransactionReference(reference);
  }

  static async hasPendingLoan(itemId: string): Promise<boolean> {
    return Boolean(
      (await transactionReference.countDocuments({ itemId, reason: TransactionReason.LOAN_PAYMENT, used: false }).exec()) > 0
    );
  }

  public static generateReferenceNumber(): string {
    return generate({
      prefix: "ref-",
      pattern: "####-####-####",
      charset: "1234567890abcdefghijklmnopqrstuvwxyz",
      count: 1,
    })[0];
  }
}
