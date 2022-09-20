import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class AdminComment extends BaseEntity {
  @prop()
  title?: string;

  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  description: string;
}

export default getModelForClass(AdminComment);
