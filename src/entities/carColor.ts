import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class CarColor extends BaseEntity {
  @prop()
  color: string;

  @prop()
  slug: string;

  @prop()
  description: string;
}

export default getModelForClass(CarColor);
