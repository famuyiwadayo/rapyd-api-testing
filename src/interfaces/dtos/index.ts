export { AccountDto, UpdateAccountDto, VerifyEmailDto, ChangePasswordDto, ResetPasswordDto } from "./account.dto";
export { loginDto, registerDto } from "./auth.dto";

export { addPermissionDto } from "./role.dto";

// export type { RedeemEarningsDto } from "./earning.dto";

export type { BiodataDto, DocumentUploadDto, AddGuarantorsDto, ApplicationStatusDto, DeclineApplicationDto } from "./onboarding.dto";

export type {
  UpdateVehicleDto,
  CreateVehicleDto,
  CreateVehicleColorDto,
  CreateVehicleFeatureDto,
  CreateVehicleTypeDto,
} from "./car.dto";

export type { CreateComplaintDto, CreateComplaintFeedbackDto } from "./complaint.dto";

export type { AddPaymentItemDto } from "./payment.dto";

export type { GetPeriodicVehicleInstalmentDto } from "./finance.dto";

export type { CreateServicingDto } from "./servicing.dto";

export type { RequestLoanDto } from "./loan.dto";

export type { VerifyNinDto, VerifyDriversLicenseDto, VerifyBvnDto, VerifyAddressDto } from "./verifyMe.dto";
export { VerifyMeRoute } from "./verifyMe.dto";

export * from "./registrationRequest.dto";
