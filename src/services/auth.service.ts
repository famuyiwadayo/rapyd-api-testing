// @ts-nocheck

import { sign, verify } from "jsonwebtoken";
import { createError, getUpdateOptions, setExpiration } from "../utils";
import {
  loginDto,
  registerDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "../interfaces/dtos";
import { AuthPayload, Auth } from "../interfaces/ros";
import { authToken, authVerification, Account, account } from "../entities";
import {
  AccountService,
  RoleService,
  PasswordService,
  AuthVerificationService,
  // ReferralService,
} from "../services";
import config from "../config";
import { AvailableRole } from "../entities/role";
import { AuthVerificationReason } from "../valueObjects";

export default class AuthService {
  private accountService = new AccountService();

  async login(data: loginDto, deviceId: string): Promise<Auth> {
    // validateFields(data);
    console.log("DEVICE ID", deviceId);
    const acc = await this.accountService.findByLogin(
      data.email,
      data.password
    );
    const payload = AuthService.transformUserToPayload(acc);
    const { token, expiration } = await this.addToken(payload, deviceId);
    payload.exp = expiration;
    return { payload, token };
  }

  async register(
    data: registerDto,
    deviceId: string,
    roles?: string[]
  ): Promise<Auth> {
    // validateFields(data);

    if (await this.accountService.checkEmailExists(data.email))
      throw createError("Email already exist", 400);
    const acc = await this.accountService.createAccount(data, roles);
    const payload = AuthService.transformUserToPayload(acc);
    const { token, expiration } = await this.addToken(payload, deviceId);
    payload.exp = expiration;
    return { payload, token };
  }

  async registerWithRole(
    data: registerDto,
    role: AvailableRole,
    deviceId: string
  ): Promise<Auth> {
    if (await this.accountService.checkEmailExists(data.email))
      throw createError("Email already exist", 400);

    const _role = await RoleService.getRoleBySlug(role);
    const acc = await this.accountService.createAccount(data, [_role?._id]);
    // if (data?.refCode) await ReferralService.createRef(data.refCode, acc?._id);

    const payload = AuthService.transformUserToPayload(acc);
    const { token, expiration } = await this.addToken(payload, deviceId);
    payload.exp = expiration;

    console.log(`Registered new user with refCode ${data?.refCode}`);
    return { payload, token };
  }

  public async requestEmailVerification(
    accountId: string
  ): Promise<{ message: string }> {
    await new AuthVerificationService().requestEmailVerification(
      accountId,
      AuthVerificationReason.ACCOUNT_VERIFICATION
    );
    return { message: "Verification code sent" };
  }

  async verifyEmail(
    accountId: string,
    code: string,
    roles: string[],
    deviceId: string
  ): Promise<Auth> {
    const acc = await this.accountService.verifyEmail(
      { accountId, code },
      roles
    );
    const payload = AuthService.transformUserToPayload(acc);
    const { token, expiration } = await this.addToken(payload, deviceId);
    payload.exp = expiration;
    return { payload, token };
  }

  async validateAuthCode(
    token: string,
    deviceId: string
  ): Promise<AuthPayload> {
    const auth = await authToken
      .findOne({ token, deviceId })
      .select("token")
      .lean()
      .exec();
    if (!auth) throw createError("Authorization code is invalid", 401);
    const payload: AuthPayload = verify(auth.token, config.JWT_SECRET, {
      audience: config.JWT_AUDIENCE,
    }) as AuthPayload;
    if (Date.now() > (payload.exp as number))
      throw createError("Token expired", 401);
    return payload;
  }

  async requestResetPasswordToken(email: string) {
    const acc = await account.findOne({ email }).select("_id").lean().exec();
    if (!acc) throw createError("Account not found", 404);
    await new AuthVerificationService().requestResetPassword(acc._id);
    return { message: "Reset link sent to your email" };
  }

  async resetPassword(input: ResetPasswordDto) {
    const acc = await this.accountService.resetPassword(input);
    await AuthService.invalidateAuthCode(input.accountId);
    return acc;
  }

  static async invalidateAuthCode(accountId: string): Promise<boolean> {
    return Boolean(
      await authToken
        .findOneAndUpdate({ accountId }, { token: "", exp: 0 })
        .select("_id")
        .lean()
        .exec()
    );
  }

  private async addToken(
    payload: AuthPayload,
    deviceId: string
  ): Promise<{ token: string; expiration: number }> {
    const jwt = AuthService.generateToken(payload);
    await authToken
      .findOneAndUpdate(
        { accountId: payload.sub },
        {
          token: jwt.token,
          lastLogin: new Date(),
          exp: jwt.expiration,
          deviceId,
        },
        getUpdateOptions()
      )
      .lean()
      .exec();
    return jwt;
  }

  private static generateToken(payload: AuthPayload): {
    token: string;
    expiration: number;
  } {
    const expiration = setExpiration(14); // token is set to expire in 14 days
    const token = sign({ ...payload }, config.JWT_SECRET, {
      audience: config.JWT_AUDIENCE,
      expiresIn: expiration,
    });
    return { token, expiration };
  }

  private static transformUserToPayload(acc: Account): AuthPayload {
    return {
      sub: acc._id as string,
      email: acc.email,
      roles: acc.roles as string[],
      isVerified: acc?.isEmailVerified,
    };
  }
}
