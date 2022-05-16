import { VehicleColor, VehicleFeature, VehicleType } from "../../entities";
import { FuelType, GearBox, VehicleImage } from "../../entities/vehicle";

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: string;
  price: number;
  seats: string;
  instalmentPrice: number;
  annualPercentageRate: number;
  gearBox: GearBox;
  fuelType: FuelType;
  color: string;
  features: string[];
  mileage: string; // in kilometers
  description: string;
  available: boolean;
  images: string[] | VehicleImage[];
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  deleteImages?: string[];
}

export interface CreateVehicleColorDto extends Omit<VehicleColor, "slug"> {}
export interface CreateVehicleFeatureDto extends Omit<VehicleFeature, "slug"> {}
export interface CreateVehicleTypeDto extends Omit<VehicleType, "slug"> {}
