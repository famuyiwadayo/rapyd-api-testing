import { RapydEventTypes } from "../libs";
import { addEvent } from "../decorators";
import { EmailService, NotificationService, Template } from "../services";
import { log } from "../utils";

export class FinanceEventListener {
  @addEvent("finance:initialPayment")
  static async onInitialPayment({ account, amount }: RapydEventTypes["finance:initialPayment"]) {
    const driver = await NotificationService.getAccount(account as string);
    const message = `👏 ${driver?.name} paid his/her initial deposit`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "finance",
        isAdmin: true,
        event: "finance:initialPayment",
      }),
      NotificationService.create({
        message: `👏 Your initial deposit has been verified`,
        display: true,
        owner: account,
        resource: "finance",
        event: "finance:initialPayment",
      }),

      !!driver &&
        EmailService.sendEmail("Initial Vehicle Deposit", driver?.email!, Template.INITIAL_PAYMENT, {
          amount,
          name: driver?.firstName,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to driver:${account}`);
  }

  @addEvent("finance:weeklyPayment")
  static async onWeeklyPayment({ account, amount }: RapydEventTypes["finance:weeklyPayment"]) {
    const driver = await NotificationService.getAccount(account as string);
    const message = `👏 ${driver?.name} paid his/her weekly payment`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "finance",
        isAdmin: true,
        event: "finance:weeklyPayment",
      }),
      NotificationService.create({
        message: `Your weekly payment has been verified`,
        display: true,
        owner: account,
        resource: "finance",
        event: "finance:weeklyPayment",
      }),

      !!driver &&
        EmailService.sendEmail("Weekly Vehicle Payment", driver?.email!, Template.WEEKLY_PAYMENT, {
          amount,
          name: driver?.firstName,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to driver:${account}`);
  }
}
