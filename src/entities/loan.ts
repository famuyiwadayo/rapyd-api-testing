import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Finance } from "./finance";
import { TransactionReference } from "./transactionReference";

export enum LoanStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DECLINED = "declined",
  PAID = "paid",
}

@index({ "$**": "text" })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Loan extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ ref: () => Finance })
  finance: Ref<Finance>;

  @prop()
  amount: number;

  @prop()
  balance: number;

  @prop()
  amountPaid: number;

  @prop()
  duration: number; // in days.

  @prop()
  title: string;

  @prop()
  description: string;

  @prop({ enum: LoanStatus, default: LoanStatus.PENDING })
  status: LoanStatus;

  @prop({ ref: () => TransactionReference })
  txRefs: Ref<TransactionReference>[];

  @prop()
  paybackDate: Date;

  @prop({ default: false })
  isOverdue: boolean;
}

export default getModelForClass(Loan);
