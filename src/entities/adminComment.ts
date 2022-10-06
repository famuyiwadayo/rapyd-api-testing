import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

export enum AdminCommentStatus {
  UNRESOLVED = "unresolved",
  RESOLVED = "resolved",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class AdminComment extends BaseEntity {
  @prop()
  title?: string;

  @prop({ ref: () => Account })
  creator: Ref<Account>;

  @prop({ ref: () => Account })
  driver: Ref<Account>;

  @prop()
  description: string;

  @prop({ type: () => String })
  images: string[];

  @prop({ ref: () => Account })
  resolver: Ref<Account>;

  @prop({ enum: AdminCommentStatus, default: AdminCommentStatus.UNRESOLVED })
  status: AdminCommentStatus;
}

export default getModelForClass(AdminComment);
