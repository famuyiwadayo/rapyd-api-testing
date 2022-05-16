import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import BaseEntity from "./base";
import { VehicleColor } from "./vehicleColor";
import { VehicleFeature } from "./vehicleFeature";
import { VehicleType } from "./vehicleType";

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

export class VehicleImageMetadata {
  @prop()
  isCover: boolean;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class VehicleImage extends BaseEntity {
  @prop()
  url: string;

  @prop({ type: () => VehicleImageMetadata, _id: false })
  metadata: VehicleImageMetadata;
}

@index({ "$**": "text" })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Vehicle extends BaseEntity {
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

  @prop()
  annualPercentageRate: number;

  @prop({ enum: GearBox })
  gearBox: GearBox;

  @prop({ enum: FuelType })
  fuelType: FuelType;

  @prop({ ref: () => VehicleColor })
  color: Ref<VehicleColor>;

  @prop({ ref: () => VehicleType })
  type: Ref<VehicleType>;

  @prop({ ref: () => VehicleFeature })
  features: Ref<VehicleFeature>[];

  @prop()
  mileage: string; // in kilometers

  @prop()
  description: string;

  @prop()
  isAvailable: boolean;

  @prop({ type: () => VehicleImage })
  images: VehicleImage[];

  @prop()
  rapydId: string;
}

export default getModelForClass(Vehicle);
