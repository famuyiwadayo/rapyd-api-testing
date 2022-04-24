// @ts-nocheck
import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Gender } from "../valueObjects";
import BaseEntity from "./base";
import { Role } from "./role";
export class AccountControl {
  @prop({ default: false })
  enabled: boolean;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Account extends BaseEntity {
  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop()
  avatar?: string;

  @prop({ enum: Gender })
  gender: Gender;

  @prop({ trim: true, lowercase: true })
  email: string;

  @prop({ select: false })
  password: string;

  @prop()
  primaryRole?: string;

  @prop()
  phone?: string;

  @prop({ ref: () => Role })
  roles?: Ref<Role>[];

  @prop({ type: () => AccountControl, _id: false })
  control?: AccountControl;

  @prop({ default: false })
  isEmailVerified?: boolean;

  @prop({ index: true, unique: true })
  refCode: string;
}

export default getModelForClass(Account);
