import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

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
