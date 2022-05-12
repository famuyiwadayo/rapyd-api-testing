import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
import { Complaint } from "./complaint";

@modelOptions({ schemaOptions: { timestamps: true } })
export class ComplaintFeedback extends BaseEntity {
  @prop()
  comment: string;

  @prop({ ref: () => Account })
  creator: Ref<Account>;

  @prop({ ref: () => Complaint })
  complaint: Ref<Complaint>;
}

export default getModelForClass(ComplaintFeedback);
