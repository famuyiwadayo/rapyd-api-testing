import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { TransactionReason } from "../valueObjects";
import { Account } from "./account";
import BaseEntity from "./base";

export enum PaymentMethod {
  ONLINE = "online",
  TRANSFER = "transfer",
}

export class TransactionReference extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  reference: string;

  @prop()
  amount: number;

  @prop({ enum: TransactionReason })
  reason: TransactionReason;

  @prop({ type: () => String })
  roles: string[];

  @prop()
  used: boolean;

  @prop()
  itemId: string;

  @prop()
  saveCard: boolean;

  @prop()
  orderNo: string;

  @prop({ enum: PaymentMethod, default: PaymentMethod.ONLINE })
  paymentMethod: PaymentMethod;

  @prop()
  bankTransferProof: string;
}

export default getModelForClass(TransactionReference);
