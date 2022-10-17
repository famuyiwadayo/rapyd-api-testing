// import { ContactsApi, ContactsApiApiKeys, CreateContact } from "sib-api-v3-typescript";

import sgMail from "@sendgrid/mail";

import * as fs from "fs";
import * as path from "path";
import * as hbs from "handlebars";

import config from "../config";
import { createError } from "../utils";

// Configure API key authorization: api-key
// const apiInstance = new ContactsApi();
// apiInstance.setApiKey(ContactsApiApiKeys.apiKey, config.SEND_IN_BLUE_KEY);

sgMail.setApiKey(config.SENDGRID_KEY);

export enum Template {
  VERIFICATION = "/emails/verification.html", // {name: '', link: ''}
  RESET_PASSWORD = "/emails/resetPassword.html",
  ADMIN_INVITE = "/emails/adminRegistrationRequest.html", // needs {link: '', name: ''};

  // TODO: Test and implement sending the emails
  GUARANTOR_INVITE = "/emails/guarantorsInvite.html", // needs {link: '', name: '', driver_name: ''}; ❌Tested, ✅ Sent
  GUARANTOR_REJECTION = "/emails/guarantorRejected.html", // needs {guarantor_name: '', name: ''};  ❌Tested, ✅ Sent
  GUARANTOR_VERFICATION = "/emails/guarantorVerified.html", // needs {guarantor_name: '', name: ''}; ❌Tested, ✅ Sent
  INITIAL_PAYMENT = "/emails/initialPayment.html", // needs {amount: '', name: ''}; ❌Tested, ✅ Sent
  WEEKLY_PAYMENT = "/emails/weeklyPayment.html", // needs {amount: '', name: ''}; ❌Tested, ✅ Sent
  LOAN_REQUEST = "/emails/loanRequest.html", // needs {name: ''}; ❌Tested, ✅ Sent
  LOAN_REJECTED = "/emails/loanRejected.html", // needs {name: ''}; ❌Tested, ✅ Sent
  LOAN_REPAYMENT = "/emails/loanRepayment.html", // needs {amount: '', name: ''}; ❌Tested, ✅ Sent
  SERVICE_SCHEDULE = "/emails/serviceSchedule.html", // needs {date: '', name: '', location: ''}; ❌Tested, ✅ Sent
  APPLICATION_APPROVED = "/emails/applicationApproved.html", // needs {name: ''}; ❌Tested, ✅ Sent
  APPLICATION_REJECTED = "/emails/applicationRejected.html", // needs {name: ''}; ❌Tested, ✅ Sent
  APPLICATION_UNDER_REVIEW = "/emails/applicationUnderReview.html", // needs {name: ''}; ❌Tested, ✅ Sent
}

export default class EmailService {
  static async sendEmail(subject: string, email: string, _template: Template, data: any) {
    const html = fs.readFileSync(path.join(__dirname, "..", _template.toString())).toString();

    // console.log("sendEmail", config.SENDGRID_KEY, email);

    const template = hbs.compile(html),
      htmlToSend = template(data);

    try {
      await sgMail.send({
        from: {
          name: "Rapyd",
          email: "rapydcarsltd@gmail.com",
        },
        subject,
        to: email,
        html: htmlToSend,
      });
    } catch (error) {
      console.log(error);
      throw createError(error.message, 500);
    }
  }
}
