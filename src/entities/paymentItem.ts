import { getModelForClass, prop } from "@typegoose/typegoose";
import { TransactionReason } from "../valueObjects";
import BaseEntity from "./base";

export class PaymentItem extends BaseEntity {
  @prop({ enum: TransactionReason })
  for: TransactionReason;

  @prop()
  amount: number;
}

export default getModelForClass(PaymentItem);
