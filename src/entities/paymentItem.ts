import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

export enum PaymentItemFor {
  ONBOARDING_PAYMENT = "onboard_payment",
  BANK_TRANSFER = "bank_transfer",
  VEHICLE_INTEREST = "vehicle_interest"
}


@modelOptions({ schemaOptions: { timestamps: true } })
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

  @prop()
  duration: string;

  @prop()
  apr: number; // annual percentage rate

  
}

export default getModelForClass(PaymentItem);
