// @ts-nocheck

import { compareSync, hashSync } from "bcryptjs";
import { createError } from "../utils";
import { account, Account } from "../entities";
import { ChangePasswordDto, ResetPasswordDto } from "../interfaces/dtos";

abstract class IPasswordService {
  getPassword(accountId: string): Promise<string>;
  addPassword(accountId: string, password: string): Promise<Account>;
  checkPassword(accountId: string, password: string): Promise<boolean>;
  resetPassword(accountId: string, input: ResetPasswordDto): Promise<boolean>;
  changePassword(accountId: string, input: ChangePasswordDto): Promise<Account>;
}

export default class PasswordService implements IPasswordService {
  public async getPassword(accountId: string): Promise<string> {
    const acc = await account
      .findOne({ _id: accountId })
      .select("password")
      .lean()
      .exec();
    if (!acc) throw createError("Account not found", 404);

    return acc.password;
  }

  public async addPassword(
    accountId: string,
    password: string
  ): Promise<Account> {
    const acc = await account
      .findByIdAndUpdate(
        accountId,
        { password: hashSync(password, 8) },
        { useFindAndModify: false }
      )
      .lean()
      .exec();
    if (!acc) throw createError("Account not found", 404);
    return acc;
  }

  public async changePassword(
    accountId: string,
    input: ChangePasswordDto
  ): Promise<Account> {
    if (!(await this.checkPassword(accountId, input.currentPassword)))
      throw createError("Incorrect password", 401);

    const acc = await account
      .findByIdAndUpdate(
        accountId,
        { password: hashSync(input.newPassword, 8) },
        { useFindAndModify: false }
      )
      .lean()
      .exec();
    return acc;
  }

  public async checkPassword(
    accountId: string,
    password: string
  ): Promise<boolean> {
    const passwordHashInDb = await this.getPassword(accountId);
    return compareSync(password, passwordHashInDb);
  }
}
