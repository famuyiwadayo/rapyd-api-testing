import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Finance } from "./finance";
import { PaymentMethod, TransactionReference } from "./transactionReference";

export enum LoanPaymentStatus {
  PENDING = "pending",
  UNPAID = "unpaid",
  CONFIRMED = "confirmed",
  PART_PAID = "part_paid",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class LoanSpread extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ ref: () => "Finance" })
  finance: Ref<Finance>;

  @prop({ ref: () => TransactionReference })
  txRef: Ref<TransactionReference>;

  @prop()
  instalment: number;

  @prop()
  instalmentId: string;

  @prop({ default: 0 })
  amountPaid: number;

  @prop()
  nextInstalmentId: string;

  @prop()
  prevInstalmentId: string;

  @prop()
  paybackDue: Date;

  @prop()
  paidOn: Date;

  @prop()
  partPaidOn: Date;

  @prop({ enum: LoanPaymentStatus, default: LoanPaymentStatus.UNPAID })
  status: LoanPaymentStatus;

  @prop({ default: false })
  paid: boolean;

  @prop()
  isOverdue: boolean;

  @prop({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;
}

export default getModelForClass(LoanSpread);
