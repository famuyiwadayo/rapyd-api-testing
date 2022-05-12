import {
  IPaystackChargeResponse,
  IPaystackInitTransactionResponse,
} from "../interfaces/ros";
import config from "../config";
import { account, Account } from "../entities";
import PaymentService from "./payment.service";
import { TransactionReferenceService } from "../services";
import { PaystackRoute, TransactionReason } from "../valueObjects";
import request from "request-promise";
import { createError } from "../utils";

import consola from "consola";

export default class PaystackService {
  public async initializeTransaction(
    accountId: string,
    amount: number,
    itemId: string,
    roles: string[],
    reason: TransactionReason,
    callbackUrl?: string
  ): Promise<IPaystackInitTransactionResponse> {
    const user: Account = await account
      .findById(accountId)
      .lean<Account>()
      .exec();
    const reference = (
      await new TransactionReferenceService().addTransactionReference(
        accountId,
        amount,
        roles,
        reason,
        itemId
      )
    ).reference;
    callbackUrl = callbackUrl || config.paystackCallbackUrl;
    return request(
      PaystackService.createUrl(PaystackRoute.INITIALIZE_TRANSACTION),
      {
        body: {
          email: user.email,
          reference: reference,
          amount: amount * 100,
          callback_url: callbackUrl,
        },
        method: "POST",
        json: true,
        headers: PaystackService.getHeaders(),
      }
    ).catch((err) => {
      throw PaystackService.handleError(err);
    });
  }

  public async chargeCheckPending(
    reference: string
  ): Promise<IPaystackChargeResponse> {
    const result: IPaystackChargeResponse = await request(
      PaystackService.createUrl(PaystackRoute.CHARGE, reference),
      {
        method: "GET",
        json: true,
        headers: PaystackService.getHeaders(),
      }
    ).catch((err) => {
      throw PaystackService.handleError(err);
    });
    await PaymentService.checkTransactionApproved(result);
    return result;
  }

  // noinspection JSMethodCanBeStatic
  // private async checkTransactionApproved(response: IPaystackChargeResponse) {
  //     const data = response.data;
  //     const amount = response.data.amount / 100;
  //     console.log('Verifying transaction: ', response);
  //     const transactionReferenceService = new TransactionReferenceService();
  //     const transactionReference = await transactionReferenceService.getTransactionReference(data.reference);
  //     if (transactionReference.used) return console.warn('>>>>>>>Transaction reference already used');
  //     if (data.status === PaystackChargeStatus.SUCCESS) {
  //         if (transactionReference.saveCard) {
  //             const authorization = data.authorization;
  //             await new CardService().saveCard(transactionReference.userId, transactionReference.role, authorization.bin, authorization.last4, authorization.brand,
  //                 authorization.exp_month, authorization.exp_year, authorization.authorization_code, authorization.signature, authorization.reusable);
  //         }
  //         switch (transactionReference.reason) {
  //             case TransactionReason.WALLET_FUNDING:
  //                 await new WalletService().giveValue(transactionReference.userId, transactionReference.role, amount, null, transactionReference.property);
  //                 await transactionReferenceService.markReferenceUsed(data.reference, true);
  //                 break;
  //             case TransactionReason.CARD_ADDING:
  //                 await transactionReferenceService.markReferenceUsed(data.reference, true);
  //                 break;
  //         }
  //     }
  // }

  private static handleError(err: any) {
    const error = err.error;
    console.error("**** Original Paystack Error message: ", err.message);
    if (!error) throw createError("Payment failed", 500);
    if (!error.data)
      throw createError(error.message ? error.message : "Payment failed", 400);
    const data = error.data;
    throw createError(data.message, 400);
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${config.PAYSTACK_AUTHORIZATION}`,
      Accept: "application/json",
    };
  }

  public static createUrl(route: PaystackRoute, path?: string): string {
    if (path && !path.startsWith("/")) path = `/${path}`;
    let url = `https://api.paystack.co/${route}`;
    if (path) url = url.concat(path);
    consola.info("Calling paystack: ", url);
    return url;
  }
}
