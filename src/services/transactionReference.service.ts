import { generate } from "voucher-code-generator";

import RoleService from "./role.service";
import { PaginatedDocument, IPaginationFilter } from "../interfaces/ros";
import { PermissionScope, TransactionReason } from "../valueObjects";
import { createError, getUpdateOptions, paginate, stripUpdateFields } from "../utils";
import { AvailableResource, AvailableRole, PaymentMethod, transactionReference, TransactionReference } from "../entities";

export default class TransactionReferenceService {
  public async getTransactionReferences(
    roles: string[],
    filters: IPaginationFilter & { paid?: boolean; reason?: TransactionReason }
  ): Promise<PaginatedDocument<TransactionReference[]>> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.HISTORY, [
      PermissionScope.READ,
      PermissionScope.ALL,
    ]);

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
    });
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

  public async updateTransactionReference(reference: string, body: TransactionReference): Promise<TransactionReference> {
    stripUpdateFields(body);
    return await transactionReference.findOneAndUpdate({ reference }, body).lean<TransactionReference>().exec();
  }

  public async getTransactionReference(
    reference: string,
    validate = true,
    roles?: string[],
    authenticate = false
  ): Promise<TransactionReference> {
    if (roles && authenticate)
      await RoleService.requiresPermission([AvailableRole.SUPERADMIN, AvailableRole.MODERATOR], roles, AvailableResource.HISTORY, [
        PermissionScope.READ,
        PermissionScope.ALL,
      ]);

    let txRef = transactionReference.findOne({ reference }).populate("account").lean<TransactionReference>().exec();

    if (!txRef && validate) throw createError(`Transaction reference not found`, 400);
    return txRef;
  }

  public async markReferenceUsed(reference: string, used: boolean): Promise<TransactionReference> {
    await transactionReference.findOneAndUpdate({ reference }, { used }).exec();
    console.log(">>>>Marking reference used");
    return await this.getTransactionReference(reference);
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
