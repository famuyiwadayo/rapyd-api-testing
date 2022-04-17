export class AuthPayload {
  sub: string;
  email: string;
  roles: string[];
  exp?: number;
}

export class Auth {
  payload: AuthPayload;
  token: string;
}
