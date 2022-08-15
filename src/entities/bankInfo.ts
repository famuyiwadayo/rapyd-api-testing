// @ts-nocheck

import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class BankInfo extends BaseEntity {
  @prop()
  bankName: string;

  @prop()
  accountName: string;

  @prop()
  accountNo: string;

  @prop({ref: () => "Account" })
  account: Ref<Account>;
}

export default getModelForClass(BankInfo);
