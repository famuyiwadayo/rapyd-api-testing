import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Servicing extends BaseEntity {
  @prop({ ref: () => Account })
  driver: Ref<Account>;

  @prop()
  odometer: string;

  @prop()
  location: string;

  @prop()
  date: Date;

  @prop()
  comment: string;
}

export default getModelForClass(Servicing);
