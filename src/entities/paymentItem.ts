import { getModelForClass, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

export enum PaymentItemFor {
  ONBOARDING_PAYMENT = "onboard_payment",
  BANK_TRANSFER = "bank_transfer",
}

export class PaymentItem extends BaseEntity {
  @prop({ enum: PaymentItemFor })
  for: PaymentItemFor;

  @prop()
  amount: number;

  @prop()
  bankName: string;

  @prop()
  accountName: string;

  @prop()
  accountNumber: string;
}

export default getModelForClass(PaymentItem);
