import { TransactionReason, PaystackChargeStatus, PermissionScope } from "../valueObjects";
import PaystackService from "./paystack.service";
import { IPaystackInitTransactionResponse, IPaystackChargeResponse } from "../interfaces/ros";
import TransactionReferenceService from "./transactionReference.service";
import { createError, getUpdateOptions, validateFields } from "../utils";
import { AddPaymentItemDto } from "../interfaces/dtos";
import {
  paymentItem,
  PaymentItem,
  AvailableResource,
  AvailableRole,
  PaymentMethod,
  TransactionReference,
  transactionReference,
  PaymentItemFor,
  Account,
  TransactionReferenceStatus,
} from "../entities";
import RoleService from "./role.service";
import OnboardingService from "./onboarding.service";
import FinanceService from "./finance.service";
import LoanService from "./loan.service";
import AccountService from "./account.service";
// import { isEmpty, omit, pick } from "lodash";

export default class PaymentService {
  public async initTransaction(
    accountId: string,
    roles: string[],
    body: {
      amount: number;
      itemId: string;
      reason: TransactionReason;
      inline?: boolean;
      receipt?: string;
      callbackUrl?: string;
      method?: PaymentMethod;
    }
  ): Promise<IPaystackInitTransactionResponse | TransactionReference> {
    if (!body.reason) throw createError("Transaction reason is required", 400);
    // const role = UserRole.PATIENT;
    console.log(">>> Initialising payment: ", body);
    let itemId = body.itemId,
      amount = body.amount;
    switch (body.reason) {
      case TransactionReason.ONBOARDING_PAYMENT:
        if (!body.itemId) throw createError("itemId is required", 400);
        const item = await this.getPaymentItem(body.itemId, roles);
        itemId = item._id!;
        amount = item.amount;
        break;
      case TransactionReason.LOAN_PAYMENT:
        if (!body.itemId) throw createError("itemId is required", 400);
        if (!body.amount) throw createError("amount is required", 400);
        if (+body?.amount < 100) throw createError("amount is too small", 400);
        await LoanService.checkLoanBeforePaymentUpdate(body.itemId, body.amount);
        break;
      case TransactionReason.AUTO_PAYBACK:
        if (!body.itemId) throw createError("itemId is required", 400);
        if (!body.amount) throw createError("amount is required", 400);
        if (+body?.amount < 100) throw createError("amount is too small", 400);
        await FinanceService.checkFianceBeforePaymentUpdate(body.itemId, body.amount);
        break;
    }

    if (body?.method && body?.method === PaymentMethod.TRANSFER) {
      if (!body?.receipt) throw createError("receipt is required", 400);
      return await PaymentService.initializeBankTransferTransaction(
        accountId,
        amount,
        itemId,
        roles,
        body.reason,
        body.method,
        body?.receipt
      );
    }

    return await new PaystackService().initializeTransaction(accountId, amount, itemId, roles, body.reason, body.callbackUrl);
  }

  public async checkStatus(reference: string): Promise<IPaystackChargeResponse> {
    if (!reference) throw createError("Reference is required", 400);
    return await new PaystackService().chargeCheckPending(reference);
  }

  public async addPaymentItem(input: AddPaymentItemDto, roles: string[], dryRun: boolean = false): Promise<PaymentItem> {
    if (!input?.for) throw createError("for is required", 400);

    if (input.for === PaymentItemFor.ONBOARDING_PAYMENT) validateFields(input, ["amount", "for"]);
    if (input.for === PaymentItemFor.BANK_TRANSFER) validateFields(input, ["bankName", "accountName", "accountNumber"]);
    if (input.for === PaymentItemFor.VEHICLE_INTEREST) validateFields(input, ["duration", "apr"]);

    const supportedValues = Object.values(PaymentItemFor);
    if (!supportedValues.includes(input.for))
      throw createError(`'${input.for}' is not supported, supported values are ${supportedValues.join(", ")}`, 400);

    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.PAYMENT_ITEM, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);

    // input = omit(input, 'interest') as any;
    let where: any = { for: input.for };
    switch (input.for) {
      case PaymentItemFor.VEHICLE_INTEREST:
        Object.assign(where, { duration: input.duration });
        break;
      default:
        break;
    }

    const _payItem = await paymentItem
      .findOneAndUpdate(where, { ...input }, getUpdateOptions())
      .lean<PaymentItem>()
      .exec();

    if (!dryRun && !_payItem) throw createError("Unable to add payment item", 400);
    return _payItem;
  }

  static async getAPR(duration: string | number, validate = true): Promise<number> {
    const result = await paymentItem.findOne({ for: PaymentItemFor.VEHICLE_INTEREST, duration }).lean<PaymentItem>().exec();
    if (validate && !result) {
      throw createError(`Vehicle Interest payment item for ${duration} months not found, please contact the administrator`, 404);
    }
    return result.apr ?? 0;
  }

  public async updatePaymentItem(
    id: string,
    input: Partial<AddPaymentItemDto>,
    roles: string[],
    dryRun: boolean = false
  ): Promise<PaymentItem> {
    validateFields(input, ["amount", "for"]);
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.PAYMENT_ITEM, [
      PermissionScope.CREATE,
      PermissionScope.ALL,
    ]);

    const _payItem = await paymentItem
      .findByIdAndUpdate(id, { ...input }, { new: true })
      .lean<PaymentItem>()
      .exec();
    if (!dryRun && !_payItem) throw createError("Payment item not found", 404);
    return _payItem;
  }

  public async getPaymentItems(roles: string[]): Promise<PaymentItem[]> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.READ, PermissionScope.ALL]
    );
    return await paymentItem.find().lean<PaymentItem[]>().exec();
  }

  public async getPaymentItem(id: string, roles: string[], dryRun = false): Promise<PaymentItem> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.DRIVER, AvailableRole.MODERATOR],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.READ, PermissionScope.ALL]
    );

    const _payItem = await paymentItem.findById(id).lean<PaymentItem>().exec();
    if (!dryRun && !_payItem) throw createError("Payment item not found", 404);
    return _payItem;
  }

  public async deletePaymentItem(id: string, roles: string[], dryRun = false): Promise<PaymentItem> {
    await RoleService.requiresPermission([AvailableRole.SUPERADMIN], roles, AvailableResource.PAYMENT_ITEM, [
      PermissionScope.DELETE,
      PermissionScope.ALL,
    ]);

    const _payItem = await paymentItem.findByIdAndDelete(id).lean<PaymentItem>().exec();
    if (!dryRun && !_payItem) throw createError("Payment item not found", 404);
    return _payItem;
  }

  // private static standardisePaymentResponse(response: IPaystackInitTransactionResponse): IStandardizedInitTransactionResponse {
  //     const paystackInitResponse = response as IPaystackInitTransactionResponse;
  //     return {
  //         authorization_url: paystackInitResponse.data.authorization_url,
  //         reference: paystackInitResponse.data.reference
  //     }
  //
  // }
  //
  // private static standardiseChargeResponse(response: IPaystackChargeResponse ): IStandardisedChargeResponse {
  //     console.log('Paystack response: ', response)
  //     return {
  //         amount: response.data.amount,
  //         currency: response.data.currency,
  //         reference: response.data.reference,
  //         message: response.data.message,
  //         status: response.data.status
  //     }
  // }

  public static async checkTransactionApproved(response: IPaystackChargeResponse) {
    const data = response.data;
    console.log("Verifying transaction: ", response);
    const transactionReferenceService = new TransactionReferenceService();
    const txRef = await transactionReferenceService.getTransactionReference(data.reference);
    const accountId = typeof txRef?.account === "string" ? (txRef?.account as string) : (txRef?.account as Account)?._id!;
    // const amount = transactionReference.amount;
    if (txRef.used) return console.warn(">>>>>>>Transaction reference already used");
    if (data.status.toLowerCase() === PaystackChargeStatus.SUCCESS) {
      switch (txRef.reason) {
        case TransactionReason.ONBOARDING_PAYMENT:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(data.reference, true),
            await transactionReferenceService.updateTransactionReference(data?.reference, {
              status: TransactionReferenceStatus.APPROVED,
            }),
            await OnboardingService.markOnboardingFeeAsPaid(accountId, txRef._id as string),
          ]);
          break;
        case TransactionReason.AUTO_DEPOSIT:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(data.reference, true),
            await transactionReferenceService.updateTransactionReference(data?.reference, {
              status: TransactionReferenceStatus.APPROVED,
            }),
            await FinanceService.markInitialDepositAsPaid(txRef?.itemId, accountId as string),
          ]);
          break;
        case TransactionReason.LOAN_PAYMENT:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(data.reference, true),
            await transactionReferenceService.updateTransactionReference(data?.reference, {
              status: TransactionReferenceStatus.APPROVED,
            }),
            await LoanService.updatePayback(txRef?.itemId, accountId, txRef?.amount, txRef?._id as string),
          ]);
          break;
        case TransactionReason.AUTO_PAYBACK:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(data.reference, true),
            await transactionReferenceService.updateTransactionReference(data?.reference, {
              status: TransactionReferenceStatus.APPROVED,
            }),
            await FinanceService.updatePayback(txRef?.itemId, accountId, txRef?.amount, txRef?._id as string, txRef?.paymentMethod),
          ]);
          break;
      }
    }
  }

  private static async initializeBankTransferTransaction(
    accountId: string,
    amount: number,
    itemId: string,
    roles: string[],
    reason: TransactionReason,
    method: PaymentMethod,
    proof: string
  ): Promise<TransactionReference> {
    // don't update existing tx, create new one instead.
    // const txNew = reason === TransactionReason.LOAN_PAYMENT || reason === TransactionReason.AUTO_PAYBACK;

    if (!(await AccountService.checkAccountExists(accountId))) throw createError("Account not found", 403);
    const reference = await new TransactionReferenceService().addTransactionReference(accountId, amount, roles, reason, itemId, {
      txNew: true,
      method,
      proof,
    });

    return reference;
  }

  public async approveBankTransfer(input: { account: string; reference: string; receipt: string }, roles: string[]) {
    validateFields(input, ["account", "reference", "receipt"]);
    const { account, reference, receipt } = input;

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.ACCOUNTS_ADMIN],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.APPROVE, PermissionScope.ALL]
    );

    const check = Boolean(
      await transactionReference.countDocuments({ account, reference, bankTransferProof: receipt, used: false }).exec()
    );
    if (!check) throw createError("Transaction does not exist", 404);

    try {
      await PaymentService.checkTransactionApproved({ data: { reference, status: PaystackChargeStatus.SUCCESS } } as any);
    } catch (error) {
      throw createError(error?.message, 400);
    }

    return await new TransactionReferenceService().getTransactionReference(reference);
  }

  public async declineBankTransfer(input: { reference: string }, roles: string[]) {
    validateFields(input, ["reference"]);
    const { reference } = input;

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN, AvailableRole.MODERATOR, AvailableRole.ACCOUNTS_ADMIN],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.UPDATE, PermissionScope.ALL]
    );

    const txRef = await new TransactionReferenceService().updateTransactionReference(reference, {
      status: TransactionReferenceStatus.DECLINED,
      used: false,
    });

    if (!txRef) throw createError("Transaction does not exist", 404);

    return txRef;
  }
}
