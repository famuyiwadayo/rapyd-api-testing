import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Finance } from "./finance";

export enum LoanApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DECLINED = "declined",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class LoanRequest extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ ref: () => Finance })
  finance: Ref<Finance>;

  @prop()
  amount: number;

  @prop()
  duration: number;

  @prop()
  title: string;

  @prop()
  description: string;

  @prop({ enum: LoanApplicationStatus, default: LoanApplicationStatus.PENDING })
  status: LoanApplicationStatus;
}

export default getModelForClass(LoanRequest);
