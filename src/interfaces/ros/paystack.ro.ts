import { PaystackChargeStatus, PaystackStatus } from "../../valueObjects";

export interface IBank {
  id: number;
  name: string;
  slug: string;
  code: string;
}

export interface IPaystackResponse<T> {
  status: boolean;
  message: string;
  data?: T;
}

export interface IPaystackResponseV1 {
  status: boolean;
  message: string;
  data: any;
}

export interface IOPayResponse {
  code: string;
  message: string;
  data: any;
}

export interface IPaystackInitTransactionResponse extends IPaystackResponseV1 {
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface IOPayInitTransactionResponse extends IOPayResponse {
  data: {
    orderNo: string;
    cashierUrl: string;
    reference: string;
  };
}

export interface IStandardizedInitTransactionResponse {
  authorization_url: string;
  reference: string;
}

export interface IPaystackChargeResponse extends IPaystackResponseV1 {
  data: {
    amount: number;
    currency: string;
    transaction_date: string;
    status: PaystackChargeStatus;
    reference: string;
    domain: string;
    gateway_response: string;
    message: string;
    channel: string;
    fees: number;
    url?: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      brand: string;
      signature: string;
      reusable: boolean;
    };
  };
}

export interface IStandardisedChargeResponse {
  amount: number;
  currency: string;
  reference: string;
  message: string;
  transaction_date?: string;
  status?: string;
  domain?: string;
  gateway_response?: string;
  channel?: string;
  fees?: number;
  url?: string;
  authorization?: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    card_type: string;
    brand: string;
    signature: string;
    reusable: boolean;
  };
}

export interface IPaystackBankResponse extends IPaystackResponseV1 {
  data: IBank[];
}
export interface IPaystackResolveAccountResponse extends IPaystackResponseV1 {
  data: {
    account_number: string;
    account_name: string;
  };
}
export interface IPaystackTransferReceiptResponse extends IPaystackResponseV1 {
  data: {
    recipient_code: string;
    type: string;
    name: string;
    description: string;
  };
}

export interface IPaystackTransferResponse extends IPaystackResponseV1 {
  data: {
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: string;
    transfer_code: string;
    reference: string;
    status: PaystackStatus;
  };
}

export interface IPaystackSubAccountResponse {
  subaccount_code: any;
}

export interface IPaystackBalanceResponse extends IPaystackResponseV1 {
  data: {
    currency: string;
    balance: number;
  };
}
