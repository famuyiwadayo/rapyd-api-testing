// @ts-nocheck

import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class DriverActivity extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  description: string;

  @prop()
  time: Date;
}

export default getModelForClass(DriverActivity);
