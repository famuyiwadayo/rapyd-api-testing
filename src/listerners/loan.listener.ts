import { RapydEventTypes } from "../libs";
import { addEvent } from "../decorators";
import { EmailService, NotificationService, Template } from "../services";
import { log } from "../utils";

export class LoanEventListener {
  @addEvent("loan:approved")
  static async onLoanApproved({ account, modifier }: RapydEventTypes["loan:approved"]) {
    const [driver, admin] = await Promise.all([
      NotificationService.getAccount(account as string),
      NotificationService.getAccount(modifier as string),
    ]);
    const message = `👏 Admin (${admin?.name}) approved ${driver?.name}'s loan`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "loan",
        modifier,
        isAdmin: true,
        event: "loan:approved",
      }),
      NotificationService.create({
        message: `Your loan has been approved`,
        display: true,
        owner: account,
        resource: "loan",
        modifier,
        event: "loan:approved",
      }),

      //   !!driver &&
      //     EmailService.sendEmail("Your application has been approved", driver?.email!, Template.APPLICATION_APPROVED, {
      //       name: driver?.name,
      //     }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${modifier} and driver:${account}`);
  }

  @addEvent("loan:declined")
  static async onLoanDeclined({ account, modifier }: RapydEventTypes["loan:declined"]) {
    const [driver, admin] = await Promise.all([
      NotificationService.getAccount(account as string),
      NotificationService.getAccount(modifier as string),
    ]);
    const message = `👏 Admin (${admin?.name}) declined ${driver?.name}'s loan`;
    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "loan",
        modifier,
        isAdmin: true,
        event: "loan:declined",
      }),
      NotificationService.create({
        message: `Your loan has been declined`,
        display: true,
        owner: account,
        resource: "loan",
        modifier,
        event: "loan:declined",
      }),

      !!driver &&
        EmailService.sendEmail("Loan declined", driver?.email!, Template.LOAN_REJECTED, {
          name: driver?.firstName,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to admin:${modifier} and driver:${account}`);
  }

  @addEvent("loan:repayment")
  static async onLoanRejected({ account, amount }: RapydEventTypes["loan:repayment"]) {
    const driver = await NotificationService.getAccount(account as string);
    const message = `👏 You paid back a loan sum of N${amount.toLocaleString()}`;
    await Promise.all([
      NotificationService.create({
        message: `Your loan has been declined`,
        display: true,
        owner: account,
        resource: "loan",
        event: "loan:repayment",
      }),

      !!driver &&
        EmailService.sendEmail("Loan Repayment", driver?.email!, Template.LOAN_REPAYMENT, {
          amount,
          name: driver?.firstName,
        }),
    ]);
    log("🚀 Notifications", `Sent ( ${message} ) to driver:${account}`);
  }

  @addEvent("loan:request")
  static async onApplicationUnderReview({ account }: RapydEventTypes["loan:request"]) {
    const driver = await NotificationService.getAccount(account);
    const message = `👏 Your loan is now under review`;

    await Promise.all([
      NotificationService.create({
        message,
        display: true,
        owner: account,
        resource: "loan",
        event: "loan:request",
      }),

      !!driver && EmailService.sendEmail("Loan Request", driver?.email!, Template.LOAN_REQUEST, { name: driver?.firstName }),
    ]);

    log("🚀 Notifications", `Sent ( ${message} ) to driver:${account}`);
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
