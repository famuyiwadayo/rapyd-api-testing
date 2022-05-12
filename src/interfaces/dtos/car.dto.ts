import { CarColor, CarFeature } from "entities";
import { FuelType, GearBox, CarImage } from "../../entities/car";

export interface CreateCarDto {
  make: string;
  model: string;
  year: string;
  price: number;
  seats: string;
  instalmentPrice: number;
  gearBox: GearBox;
  fuelType: FuelType;
  color: string;
  features: string[];
  mileage: string; // in kilometers
  description: string;
  available: boolean;
  images: string[] | CarImage[];
}

export interface UpdateCarDto extends Partial<CreateCarDto> {
  deleteImages?: string[];
}

export interface CreateCarColorDto extends Omit<CarColor, "slug"> {}
export interface CreateCarFeatureDto extends Omit<CarFeature, "slug"> {}
