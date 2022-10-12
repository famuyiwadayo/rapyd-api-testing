import { RapydEventTypes } from "../libs";
import { EmailService, NotificationService, Template } from "../services";
import { addEvent } from "../decorators";
import { log } from "../utils";
import { format } from "date-fns";

export class ServicingEventListener {
  @addEvent("servicing:created")
  static async OnServicingCreated({ account, date, location }: RapydEventTypes["servicing:created"]) {
    const driver = await NotificationService.getAccount(account);
    const message = `👏 You have been scheduled for servicing on ${format(date, "eee dd, MMM yyyy")} at ${location}`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "servicing",
        event: "servicing:created",
      }),
      EmailService.sendEmail(`Scheduled for servicing`, driver?.email!, Template.SERVICE_SCHEDULE, {
        date: format(date, "eee dd, MMM yyyy"),
        name: driver?.firstName,
        location,
      }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to account:${account}`);
  }
}
