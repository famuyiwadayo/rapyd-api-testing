import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Finance } from "./finance";

export enum LoanPaymentStatus {
  PENDING = "pending",
  UNPAID = "unpaid",
  CONFIRMED = "confirmed",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class LoanSpread extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ ref: () => "Finance" })
  finance: Ref<Finance>;

  @prop()
  instalment: number;

  @prop()
  instalmentId: string;

  @prop()
  nextInstalmentId: string;

  @prop()
  paybackDue: Date;

  @prop()
  paidOn: Date;

  @prop({ enum: LoanPaymentStatus, default: LoanPaymentStatus.UNPAID })
  status: LoanPaymentStatus;

  @prop()
  isDue: boolean;
}

export default getModelForClass(LoanSpread);
