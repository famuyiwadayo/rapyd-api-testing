// @ts-nocheck

import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Role } from "./role";

@modelOptions({ schemaOptions: { timestamps: true } })
export class RegistrationRequest extends BaseEntity {
  @prop({ index: true })
  token: string;

  @prop()
  email: string;

  @prop({ ref: () => Role })
  primaryRole: Ref<Role>;

  @prop({ default: false })
  used?: boolean;

  @prop()
  expiry?: number;

  @prop({ ref: () => Account })
  account: Ref<Account>;
}

export default getModelForClass(RegistrationRequest);
