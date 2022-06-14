import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import BaseEntity from "./base";
import { Account } from "./account";
import { PaymentPeriodType } from "../libs";
import { Vehicle } from "./vehicle";
// import { Loan } from "./loan";
// import { LoanSpread } from "./loanSpread";

export enum FinanceCategory {
  LOAN = "loan",
  AUTO = "auto",
}

export enum FinanceStatus {
  IN_INSTALMENTS = "in_instalments",
  TERMINATED = "terminated",
  PAID = "paid",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Finance extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ enum: FinanceCategory })
  category: FinanceCategory;

  @prop({ refPath: "onModel" })
  item: Vehicle | string;

  @prop({ type: String, required: true, enum: ["Vehicle", "LoanRequest"] })
  onModel: "Vehicle" | "LoanRequest";

  @prop()
  principal: number;

  @prop()
  duration: number;

  @prop()
  apr: number; // annual percentage rate

  @prop({ default: 0 })
  amountPaid: number;

  @prop({ default: 0 })
  cumulativeInterest: number;

  @prop()
  instalment: number;

  @prop({ default: "WEEKLY" })
  period: PaymentPeriodType;

  @prop()
  initialDeposit: number;

  @prop()
  initialDepositPaymentRef: string;

  @prop()
  initialDepositPaid: boolean;

  @prop({ default: 0 })
  totalSumWithInterest: number;

  @prop({ default: 0 })
  remainingDebt: number;

  @prop({ required: false })
  prevInstalmentId: string;

  @prop({ required: false })
  nextInstalmentId: string;

  @prop({ enum: FinanceStatus, default: FinanceStatus.IN_INSTALMENTS })
  status: FinanceStatus;
}

export default getModelForClass(Finance);
