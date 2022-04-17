// @ts-nocheck

import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Resource extends BaseEntity {
  @prop({ unique: true, lowercase: true })
  name: string;
}

export default getModelForClass(Resource);
