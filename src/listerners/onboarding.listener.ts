import { join } from "lodash";
import { RapydEventTypes } from "../libs";
import { addEvent } from "../decorators";
import { EmailService, NotificationService, Template } from "../services";
import { log } from "../utils";

export default class OnboardingEventListener {
  @addEvent("application:approved")
  static async onApplicationApproved({ owner, modifier }: RapydEventTypes["application:approved"]) {
    const [driver, admin] = await Promise.all([
      NotificationService.getAccount(owner as string),
      NotificationService.getAccount(modifier as string),
    ]);
    const message = `👏 Admin (${admin?.name}) approved ${join([driver?.firstName, driver?.lastName], " ")}'s application`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner,
        resource: "onboarding",
        modifier,
        isAdmin: true,
        event: "application:approved",
      }),
      NotificationService.create({
        message: `Your application has been approved`,
        display: true,
        owner,
        resource: "onboarding",
        modifier,
        event: "application:approved",
      }),

      !!driver &&
        EmailService.sendEmail("Your application has been approved", driver?.email!, Template.APPLICATION_APPROVED, {
          name: driver?.name,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${modifier} and driver:${owner}`);
  }

  @addEvent("application:declined")
  static async onApplicationDeclined({ owner, modifier }: RapydEventTypes["application:declined"]) {
    const [driver, admin] = await Promise.all([
      NotificationService.getAccount(owner as string),
      NotificationService.getAccount(modifier as string),
    ]);
    const message = `👏 Admin (${admin?.name}) declined ${join([driver?.firstName, driver?.lastName], " ")}'s application`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner,
        resource: "onboarding",
        modifier,
        isAdmin: true,
        event: "application:declined",
      }),
      NotificationService.create({
        message: `Your application has been declined`,
        display: true,
        owner,
        resource: "onboarding",
        modifier,
        event: "application:declined",
      }),

      !!driver &&
        EmailService.sendEmail("Your application has been declined", driver?.email!, Template.APPLICATION_REJECTED, {
          name: driver?.name,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${modifier} and driver:${owner}`);
  }

  @addEvent("application:underReview")
  static async onApplicationUnderReview({ owner }: RapydEventTypes["application:underReview"]) {
    const driver = await NotificationService.getAccount(owner);
    const message = `👏 Your application is now under review`;

    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner,
        resource: "onboarding",
        event: "application:underReview",
      }),

      !!driver &&
        EmailService.sendEmail("Application under review", driver?.email!, Template.APPLICATION_UNDER_REVIEW, { name: driver?.name }),
    ]);

    log("🚀 Notifications", `Sent ( ${message} ) to driver:${owner}`);
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
