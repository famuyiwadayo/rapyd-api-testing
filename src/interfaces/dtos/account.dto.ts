import { Gender } from "../../valueObjects";
import { registerDto } from "./auth.dto";
import { AccountBankDetails } from "../../entities";
import { DriverStatus } from "../../entities/account";

export class AccountDto extends registerDto {}

export class AddBankDto extends AccountBankDetails {}

export class UpdateAccountDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  gender?: Gender;
  status?: DriverStatus;
}

export class VerifyEmailDto {
  accountId: string;
  code: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ResetPasswordDto {
  accountId: string;
  token: string;
  password: string;
}
