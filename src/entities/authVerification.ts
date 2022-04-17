// @ts-nocheck

import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import { AuthVerificationReason } from "../valueObjects";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class AuthVerification extends BaseEntity {
  @prop()
  code?: string;

  @prop()
  token?: string;

  @prop()
  exp?: number;

  @prop({ index: true, ref: () => Account })
  accountId: Ref<Account>;

  @prop({ index: true })
  verified: boolean;

  @prop({ enum: AuthVerificationReason })
  reason: AuthVerificationReason;
}

export default getModelForClass(AuthVerification);
