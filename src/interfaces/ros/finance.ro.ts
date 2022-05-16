import { PaymentPeriodType } from "../../libs";

export interface GetPeriodicVehicleInstalmentRo {
  vehiclePrice: number;
  initialDeposit: number;
  instalment: number;
  period: PaymentPeriodType;
  apr: number; // annual percentage rate;
  pricePlusInterest: number;
  totalInterest: number;
}
