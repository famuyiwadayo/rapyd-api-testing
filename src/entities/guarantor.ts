import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";
import { Phone } from "./onboarding";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Guarantor extends BaseEntity {
  @prop()
  name: string;

  @prop()
  email: string;

  @prop({ type: () => Phone, _id: false })
  phone: Phone;
}

export default getModelForClass(Guarantor);
