import { Finance } from "../../entities";
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

export interface GetCurrentUserVehicleFinanceAnalysis {
  finance: Finance;
  analysis: {
    balance: {
      value: number;
      percentage: number;
    };
    amountPaid: {
      value: number;
      percentage: number;
    };
    total: {
      value: number;
      percentage: number;
    };
    loanBalance: {
      value: number;
      percentage: number;
    }
  };
}
