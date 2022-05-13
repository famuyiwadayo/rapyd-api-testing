import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class VehicleFeature extends BaseEntity {
  @prop()
  name: string;

  @prop()
  slug: string;

  @prop()
  description: string;
}

export default getModelForClass(VehicleFeature);
