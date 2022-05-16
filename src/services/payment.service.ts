import {
  TransactionReason,
  PaystackChargeStatus,
  PermissionScope,
} from "../valueObjects";
import PaystackService from "./paystack.service";
import {
  IPaystackInitTransactionResponse,
  IPaystackChargeResponse,
} from "../interfaces/ros";
import TransactionReferenceService from "./transactionReference.service";
import { createError, getUpdateOptions, validateFields } from "../utils";
import { AddPaymentItemDto } from "../interfaces/dtos";
import {
  paymentItem,
  PaymentItem,
  AvailableResource,
  AvailableRole,
} from "../entities";
import RoleService from "./role.service";
import OnboardingService from "./onboarding.service";
import FinanceService from "./finance.service";

export default class PaymentService {
  public async initTransaction(
    accountId: string,
    roles: string[],
    body: {
      amount: number;
      itemId: string;
      reason: TransactionReason;
      inline?: boolean;
      callbackUrl?: string;
    }
  ): Promise<IPaystackInitTransactionResponse> {
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
    }

    return await new PaystackService().initializeTransaction(
      accountId,
      amount,
      itemId,
      roles,
      body.reason,
      body.callbackUrl
    );
  }

  public async checkStatus(
    reference: string
  ): Promise<IPaystackChargeResponse> {
    if (!reference) throw createError("Reference is required", 400);
    return await new PaystackService().chargeCheckPending(reference);
  }

  public async addPaymentItem(
    input: AddPaymentItemDto,
    roles: string[],
    dryRun: boolean = false
  ): Promise<PaymentItem> {
    validateFields(input, ["amount", "for"]);
    if (!Object.values(TransactionReason).includes(input.for))
      throw createError("Invalid 'for' value", 400);

    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

    const _payItem = await paymentItem
      .findOneAndUpdate({ for: input.for }, { ...input }, getUpdateOptions())
      .lean<PaymentItem>()
      .exec();

    if (!dryRun && !_payItem)
      throw createError("Unable to add payment item", 400);
    return _payItem;
  }

  public async updatePaymentItem(
    id: string,
    input: Partial<AddPaymentItemDto>,
    roles: string[],
    dryRun: boolean = false
  ): Promise<PaymentItem> {
    validateFields(input, ["amount", "for"]);
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.CREATE, PermissionScope.ALL]
    );

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

  public async getPaymentItem(
    id: string,
    roles: string[],
    dryRun = false
  ): Promise<PaymentItem> {
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

  public async deletePaymentItem(
    id: string,
    roles: string[],
    dryRun = false
  ): Promise<PaymentItem> {
    await RoleService.requiresPermission(
      [AvailableRole.SUPERADMIN],
      roles,
      AvailableResource.PAYMENT_ITEM,
      [PermissionScope.DELETE, PermissionScope.ALL]
    );

    const _payItem = await paymentItem
      .findByIdAndDelete(id)
      .lean<PaymentItem>()
      .exec();
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

  public static async checkTransactionApproved(
    response: IPaystackChargeResponse
  ) {
    const data = response.data;
    console.log("Verifying transaction: ", response);
    const transactionReferenceService = new TransactionReferenceService();
    const txRef = await transactionReferenceService.getTransactionReference(
      data.reference
    );
    // const amount = transactionReference.amount;
    if (txRef.used)
      return console.warn(">>>>>>>Transaction reference already used");
    if (data.status.toLowerCase() === PaystackChargeStatus.SUCCESS) {
      switch (txRef.reason) {
        case TransactionReason.ONBOARDING_PAYMENT:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(
              data.reference,
              true
            ),

            await OnboardingService.markOnboardingFeeAsPaid(
              txRef.account as string,
              txRef._id as string
            ),
          ]);
          break;
        case TransactionReason.AUTO_DEPOSIT:
          await Promise.all([
            await transactionReferenceService.markReferenceUsed(
              data.reference,
              true
            ),
            await FinanceService.markInitialDepositAsPaid(
              txRef?.itemId,
              txRef.account as string
            ),
          ]);
          break;
      }
    }
  }
}
