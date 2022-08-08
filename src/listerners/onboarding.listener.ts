import { join } from "lodash";
import { RapydEventTypes } from "../libs";
import { addEvent } from "../decorators";
import { NotificationService } from "../services";
import { log } from "../utils";

export default class OnboardingEventListener {
  @addEvent("application:approved")
  static async onApplicationApproved({ owner, modifier }: RapydEventTypes["application:approved"]) {
    const [driver, admin] = await Promise.all([
      NotificationService.getAccount(owner as string),
      NotificationService.getAccount(modifier as string),
    ]);
    const message = `👏 Admin (${admin?.name}) approved ${join([driver?.firstName, driver?.lastName], ' ')}'s application`;
    await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "onboarding",
      modifier,
      isAdmin: true,
      event: "application:approved",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${modifier}`);
  }

  @addEvent("application:payment:initiated")
  static async OnApplicationPaymentInitiated({ owner }: RapydEventTypes["application:payment:initiated"]) {
    const message = `🚀 Your application payment has been initiated`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "application:payment:initiated",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note.owner}`);
  }

  @addEvent("application:payment:confirmed")
  static async OnApplicationPaymentConfirmed({ owner }: RapydEventTypes["application:payment:confirmed"]) {
    const message = `✅ Your application payment has been confirmed`;
    const note = await NotificationService.create({
      message,
      display: true,
      owner,
      resource: "account",
      event: "application:payment:confirmed",
    });
    log("🚀 Notifications", `Sent ( ${message} ) to account:${note.owner}`);
  }
}
