import { authVerification, AuthVerification } from "../entities";
import { AuthVerificationReason } from "../valueObjects";
import { generate } from "voucher-code-generator";
import { getUpdateOptions, createError } from "../utils";

import addMinutes from "date-fns/addMinutes";
import { nanoid } from "nanoid";

export default class AuthVerificationService {
  static generateCode() {
    const code: string = generate({ charset: "1234567890", length: 5 })[0];
    return code;
  }

  static async generateResetToken(
    accountId: string,
    reason: AuthVerificationReason
  ) {
    const token = nanoid(24);
    const exp = addMinutes(Date.now(), 60).getTime();

    return await authVerification.findOneAndUpdate(
      { accountId, reason },
      { accountId, reason, exp, token },
      getUpdateOptions()
    );
  }

  async requestResetPassword(accountId: string) {
    const reason = AuthVerificationReason.ACCOUNT_PASSWORD_RESET;
    let verification = await this.getPreviousVerificationIfValid(
      accountId,
      reason
    );

    if (!verification) {
      verification = await AuthVerificationService.generateResetToken(
        accountId,
        reason
      );
    }

    // send reset email here
    // /reset?token={{token}}&sub={{accountId}}
    console.log(
      "RESET TOKEN",
      `?token=${verification?.token}&sub=${accountId}`
    );

    return verification as AuthVerification;
  }

  /* TODO:
   *  send code via email to the user's email address
   */
  async requestEmailVerification(
    accountId: string,
    reason: AuthVerificationReason
  ): Promise<AuthVerification> {
    const timeout = 1; // in minutes, should be 10.
    let verification = await this.getPreviousVerificationIfValid(
      accountId,
      reason
    );
    if (!verification) {
      const exp = addMinutes(Date.now(), timeout).getTime(),
        code = AuthVerificationService.generateCode();
      verification = await authVerification.findOneAndUpdate(
        { accountId, reason },
        { accountId, reason, exp, code },
        getUpdateOptions()
      );
    }

    // send email here.
    console.log("\nEMAIL VERIFICATION CODE", verification?.code);

    return verification as AuthVerification;
  }

  public async getResetToken(
    accountId: string,
    reason: AuthVerificationReason,
    token: string,
    verify = false
  ): Promise<AuthVerification> {
    let verification = await authVerification
      .findOne({ accountId, reason })
      .select(["token", "exp"])
      .lean()
      .exec();
    if (!verification) throw createError("Reset token not requested", 400);

    if (Date.now() > verification?.exp!)
      throw createError(
        "Reset token has expired. Please request another one",
        400
      );
    if (token !== verification.token) throw createError("Invalid token", 400);

    if (verify) {
      const updatePayload = verify ? { verified: true } : {};

      verification = await authVerification
        .findByIdAndUpdate(verification._id, updatePayload, { new: true })
        .lean()
        .exec();
    }
    return verification as AuthVerification;
  }

  public async getEmailVerification(
    accountId: string,
    reason: AuthVerificationReason,
    code: string,
    verify = false
  ): Promise<AuthVerification> {
    let verification = await authVerification
      .findOne({ accountId, reason })
      .select(["code", "exp"])
      .lean()
      .exec();
    if (!verification) throw createError("Verification not requested", 400);

    if (Date.now() > verification?.exp!)
      throw createError(
        "Verification has expired. Please request another one",
        400
      );
    if (code !== verification.code) throw createError("Incorrect code", 400);

    if (verify) {
      const updatePayload = verify ? { verified: true } : {};

      verification = await authVerification
        .findByIdAndUpdate(verification._id, updatePayload, { new: true })
        .lean()
        .exec();
    }
    return verification as AuthVerification;
  }

  public async removeVerification(id: string): Promise<boolean> {
    return Boolean(
      await authVerification.findByIdAndDelete(id).select("_id").lean().exec()
    );
  }

  async getPreviousVerificationIfValid(
    accountId: string,
    reason: AuthVerificationReason
  ): Promise<AuthVerification | null> {
    const verification = await authVerification
      .findOne({ accountId, reason })
      .select(["exp", "code", "token"])
      .lean()
      .exec();
    if (!verification) return null;
    const hasExpired = Date.now() > verification?.exp!;
    return !hasExpired ? verification : null;
  }
}
