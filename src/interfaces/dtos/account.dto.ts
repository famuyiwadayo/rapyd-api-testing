import { Gender } from "../../valueObjects";
import { registerDto } from ".";

export class AccountDto extends registerDto {}

export class UpdateAccountDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  gender?: Gender;
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
