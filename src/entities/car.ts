import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import BaseEntity from "./base";
import { CarColor } from "./carColor";
import { CarFeature } from "./carFeature";

export enum GearBox {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
}

export enum FuelType {
  PETROL = "petrol",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export class CarImageMetadata {
  @prop()
  isCover: boolean;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class CarImage extends BaseEntity {
  @prop()
  url: string;

  @prop({ type: () => CarImageMetadata, _id: false })
  metadata: CarImageMetadata;
}

@index({ "$**": "text" })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Car extends BaseEntity {
  @prop()
  make: string;

  @prop()
  model: string;

  @prop()
  year: string;

  @prop()
  price: number;

  @prop()
  seats: string;

  @prop()
  instalmentPrice: number;

  @prop({ enum: GearBox })
  gearBox: GearBox;

  @prop({ enum: FuelType })
  fuelType: FuelType;

  @prop({ ref: () => CarColor })
  color: Ref<CarColor>;

  @prop({ ref: () => CarFeature })
  features: Ref<CarFeature>[];

  @prop()
  mileage: string; // in kilometers

  @prop()
  description: string;

  @prop()
  isAvailable: boolean;

  @prop({ type: () => CarImage })
  images: CarImage[];

  @prop()
  rapydId: string;
}

export default getModelForClass(Car);
