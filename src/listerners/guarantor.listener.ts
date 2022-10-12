import { RapydEventTypes } from "../libs";
import { GuarantorService, NotificationService } from "../services";
import { addEvent } from "../decorators";
import { log } from "../utils";

export class GuarantorEventListerner {
  @addEvent("guarantor:added")
  static async OnAdded({ account, guarantor }: RapydEventTypes["guarantor:added"]) {
    // const driver = await NotificationService.getAccount(account as string);
    const message = `👏 You added a new guarantor.`;
    await NotificationService.create({
      message,
      display: true,
      owner: account,
      resource: "guarantor",
      event: "guarantor:added",
    });

    await GuarantorService.sendGuarantorInvite(account, [guarantor], [], true);
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }

  @addEvent("guarantor:deleted")
  static async OnDeleted({ account }: RapydEventTypes["guarantor:deleted"]) {
    // const driver = await NotificationService.getAccount(account as string);
    const message = `👏 You deleted a guarantor.`;
    await NotificationService.create({
      message,
      display: true,
      owner: account,
      resource: "guarantor",
      event: "guarantor:deleted",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }

  @addEvent("guarantor:verified")
  static async OnVerified({ account, guarantor }: RapydEventTypes["guarantor:verified"]) {
    // const driver = await NotificationService.getAccount(account as string);
    const message = `👏 Your guarantor ${guarantor?.name} has been verified`;
    await NotificationService.create({
      message,
      display: true,
      owner: account,
      resource: "guarantor",
      event: "guarantor:verified",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }

  @addEvent("guarantor:rejected")
  static async OnRejected({ account, guarantor }: RapydEventTypes["guarantor:rejected"]) {
    // const driver = await NotificationService.getAccount(account as string);
    const message = `👏 Your guarantor ${guarantor?.name} has been rejected`;
    await NotificationService.create({
      message,
      display: true,
      owner: account,
      resource: "guarantor",
      event: "guarantor:rejected",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }

  @addEvent("guarantor:form:attempted")
  static async OnFormAttempted({ account, guarantor }: RapydEventTypes["guarantor:form:attempted"]) {
    // const driver = await NotificationService.getAccount(account as string);
    const message = `👏 A guarantor ${guarantor?.name} updated his/her details`;
    await NotificationService.create({
      message,
      display: true,
      owner: account,
      resource: "guarantor",
      event: "guarantor:form:attempted",
      isAdmin: true,
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }
}
