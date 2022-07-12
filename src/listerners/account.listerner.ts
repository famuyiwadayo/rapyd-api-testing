import { RapydEventTypes } from "../libs";
import { addEvent } from "../decorators";
import { NotificationService } from "../services";
import { log } from "../utils";

import join from "lodash/join";

export default class AccountEventListerner {
  @addEvent("account:created")
  static async OnAccountCreated({ owner }: RapydEventTypes["account:created"]) {
    const message = `👏 Your account has been created, proceed to verify your account.`;
    const note = await NotificationService.create({ message, display: true, owner, resource: "account", event: "account:created" });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note._id}`);
  }

  @addEvent("account:tested")
  static async OnAccountTested({ sub, roles }: RapydEventTypes["account:tested"]) {
    console.log("Account tested", { sub, roles, event: "account:tested" });
    log("🚀 Notifications", `Sent test notification to account:${sub}`);
  }

  @addEvent("account:bank:added")
  static async OnAccountBankAdded({ owner }: RapydEventTypes["account:bank:added"]) {
    const message = `👏 Your bank account info has been added.`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "account:bank:added",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note._id}`);
  }

  @addEvent("account:bank:removed")
  static async OnAccountBankRemoved({ owner }: RapydEventTypes["account:bank:removed"]) {
    const message = `👏 Your bank account info has been deleted.`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "account:bank:removed",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note._id}`);
  }

  @addEvent("account:password:changed")
  static async OnAccountPasswordChanged({ owner }: RapydEventTypes["account:password:changed"]) {
    const message = `🫀 You changed account password.`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "account:password:changed",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note._id}`);
  }

  @addEvent("account:deleted")
  static async OnAccountDeleted({ owner, modifier }: RapydEventTypes["account:deleted"]) {
    const admin = await NotificationService.getAccount(modifier as string);
    const message = `🥶 Admin (${admin?.name}) deleted ${join([owner?.firstName, owner?.lastName])}'s account`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      modifier,
      isAdmin: true,
      event: "account:deleted",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${note._id}`);
  }

  @addEvent("account:disabled")
  static async OnAccountDisabled({ owner, modifier }: RapydEventTypes["account:disabled"]) {
    const admin = await NotificationService.getAccount(modifier as string);
    const message = `🙊 Admin (${admin?.name}) disabled ${join([owner?.firstName, owner?.lastName])}'s account`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      modifier,
      isAdmin: true,
      event: "account:disabled",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${note._id}`);
  }

  @addEvent("account:enabled")
  static async OnAccountEnabled({ owner, modifier }: RapydEventTypes["account:enabled"]) {
    const admin = await NotificationService.getAccount(modifier as string);
    const message = `🥹 Admin (${admin?.name}) enabled ${join([owner?.firstName, owner?.lastName])}'s account`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      modifier,
      isAdmin: true,
      event: "account:enabled",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${note._id}`);
  }

  @addEvent("account:verified")
  static async OnAccountVerified({ owner }: RapydEventTypes["account:verified"]) {
    const message = `👏 Your account has been verified`;
    const note = await NotificationService.create({ message, display: true, owner, resource: "account", event: "account:verified" });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${note._id}`);
  }

  @addEvent("account:password:reset")
  static async OnAccountPasswordReset({ owner }: RapydEventTypes["account:password:reset"]) {
    const message = `🔐 Your account password has been reset`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "account:password:reset",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${note._id}`);
  }
}
