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
import { LoanSpread } from "./loanSpread";

export enum FinanceCategory {
  LOAN = "loan",
  AUTO = "auto",
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

  @prop({ ref: () => LoanSpread, required: false })
  prevInstalment?: Ref<LoanSpread>;

  @prop({ ref: () => LoanSpread, required: false })
  nextInstalment?: Ref<LoanSpread>;
}

export default getModelForClass(Finance);
