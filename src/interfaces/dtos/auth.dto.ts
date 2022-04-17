import { Gender } from "../../valueObjects";

export class loginDto {
  email: string;
  password: string;
}

export class registerDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  userName: string;
  email: string;
  gender: Gender;
  password: string;
  phone: string;
  refCode?: string;
}
