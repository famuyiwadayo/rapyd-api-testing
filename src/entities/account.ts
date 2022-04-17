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

@modelOptions({ schemaOptions: { timestamps: true } })
export class AccountVoteTracker extends BaseEntity {
  @prop()
  lastVoted?: Date;

  @prop()
  nextVotingTime?: Date;

  // @prop()
}

export class AccountControl {
  @prop({ default: false })
  enabled: boolean;
}

export class AccountVote {
  @prop()
  next?: Date;

  @prop()
  last?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Account extends BaseEntity {
  @prop()
  firstName: string;

  @prop()
  middleName?: string;

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

  @prop()
  userName?: string;

  @prop({ ref: () => Role })
  roles?: Ref<Role>[];

  @prop({ type: () => AccountControl, _id: false })
  control?: AccountControl;

  @prop({ default: false })
  isEmailVerified?: boolean;

  @prop({ type: () => AccountVote })
  vote?: AccountVote;

  @prop({ index: true, unique: true })
  refCode: string;
}

export default getModelForClass(Account);
