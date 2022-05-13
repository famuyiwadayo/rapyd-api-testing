export {
  AccountDto,
  UpdateAccountDto,
  VerifyEmailDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from "./account.dto";
export { loginDto, registerDto } from "./auth.dto";

export { addPermissionDto } from "./role.dto";

// export type { RedeemEarningsDto } from "./earning.dto";

export type {
  BiodataDto,
  DocumentUploadDto,
  AddGuarantorsDto,
  ApplicationStatusDto,
} from "./onboarding.dto";

export type {
  UpdateVehicleDto,
  CreateVehicleDto,
  CreateVehicleColorDto,
  CreateVehicleFeatureDto,
  CreateVehicleTypeDto,
} from "./car.dto";

export type {
  CreateComplaintDto,
  CreateComplaintFeedbackDto,
} from "./complaint.dto";

export type { AddPaymentItemDto } from "./payment.dto";
