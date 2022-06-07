import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
// import { Phone } from "./onboarding";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Guarantor extends BaseEntity {
  @prop()
  name: string;

  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  email: string;

  @prop()
  document: string;

  // @prop({ type: () => Phone, _id: false })
  // phone: Phone;
}

export default getModelForClass(Guarantor);
