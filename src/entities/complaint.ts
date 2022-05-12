// @ts-nocheck

import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

@index({ "$**": "text" }) // to make the $text.$search work.
@modelOptions({ schemaOptions: { timestamps: true } })
export class Complaint extends BaseEntity {
  @prop()
  subject: string;

  @prop()
  message: string;

  @prop()
  creatorRapydId: string;

  @prop({ ref: () => Account })
  creator: Ref<Account>;
}

export default getModelForClass(Complaint);
