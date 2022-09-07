import { registerDto } from "./auth.dto";

export class makeRegistrationRequestDto {
  email: string;
  role: string;
}

export class registerAccountDto extends registerDto {
  token: string;
}
