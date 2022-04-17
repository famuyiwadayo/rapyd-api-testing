import {
  ContactsApi,
  ContactsApiApiKeys,
  CreateContact,
} from "sib-api-v3-typescript";

import { MailService } from "@sendgrid/mail";

import * as fs from "fs";
import * as path from "path";
import * as hbs from "handlebars";

import config from "../config";

// Configure API key authorization: api-key
const apiInstance = new ContactsApi();
apiInstance.setApiKey(ContactsApiApiKeys.apiKey, config.SEND_IN_BLUE_KEY);

const client = new MailService();
client.setApiKey(config.SENDGRID_KEY);

enum Template {
  VERIFICATION = "/templates/verification.html",
}

export default class EmailService {
  async addToWaitlist(email: string) {
    // console.log("EMAIL", email);
    // const sendSmtpEmail: SendSmtpEmail = {
    //   to: [{ email }],
    //   templateId: 2,
    //   params: {
    //     subject: "Request join waitlist",
    //   },
    // };
    const createContact = new CreateContact();
    createContact.email = email;
    // createContact.listIds
    const res = await apiInstance.createContact(createContact);
    return res;
  }

  static async sendEmail(
    subject: string,
    email: string,
    _template: Template,
    data: any
  ) {
    const html = fs
      .readFileSync(path.join(__dirname, "..", _template.toString()))
      .toString();

    const template = hbs.compile(html),
      htmlToSend = template(data);

    await client.send({
      from: {
        name: "Rapyd",
        email: "rapyd@gmail.com",
      },
      subject,
      to: email,
      html: htmlToSend,
    });
  }
}
