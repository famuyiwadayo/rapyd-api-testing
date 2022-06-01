import { transactionReference, TransactionReference } from "../entities";
import { createError, getUpdateOptions, stripUpdateFields } from "../utils";
import { generate } from "voucher-code-generator";
import { TransactionReason } from "../valueObjects";

export default class TransactionReferenceService {
  public async addTransactionReference(
    accountId: string,
    amount: number,
    roles: string[],
    reason: TransactionReason,
    itemId?: string,
    saveCard = false,
    reference?: string,
    txNew = false
  ): Promise<TransactionReference> {
    reference =
      reference ?? TransactionReferenceService.generateReferenceNumber();

    if (txNew)
      return await transactionReference.create({
        amount,
        account: accountId,
        itemId,
        roles,
        reason,
        reference,
        saveCard,
        used: false,
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
          saveCard,
          used: false,
        },
        getUpdateOptions()
      )
      .lean<TransactionReference>()
      .exec();
  }

  public async updateTransactionReference(
    reference: string,
    body: TransactionReference
  ): Promise<TransactionReference> {
    stripUpdateFields(body);
    return await transactionReference
      .findOneAndUpdate({ reference }, body)
      .lean<TransactionReference>()
      .exec();
  }

  public async getTransactionReference(
    reference: string,
    validate = true
  ): Promise<TransactionReference> {
    const txRef: TransactionReference = await transactionReference
      .findOne({ reference })
      .lean<TransactionReference>()
      .exec();
    if (!txRef && validate)
      throw createError(`Transaction reference not found`, 400);
    return txRef;
  }

  public async markReferenceUsed(
    reference: string,
    used: boolean
  ): Promise<TransactionReference> {
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
