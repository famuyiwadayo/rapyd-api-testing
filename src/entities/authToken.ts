// @ts-nocheck

import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class AuthToken extends BaseEntity {
  @prop()
  token: string;

  @prop()
  exp: number;

  @prop({ index: true, unique: true })
  accountId: string;

  @prop()
  lastLogin: Date;
}

export default getModelForClass(AuthToken);
