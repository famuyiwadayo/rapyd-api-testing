import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Gender } from "../valueObjects";
import { Account } from "./account";
import BaseEntity from "./base";

export class Phone {
  @prop()
  home: string;

  @prop()
  work: string;
}

export class PersonalInfo {
  @prop()
  dob: Date;

  @prop({ enum: Gender })
  sex: Gender;

  @prop()
  maritalStatus: string;

  @prop()
  stateOfOrigin: string;

  @prop({ type: () => Phone, _id: false })
  phone: Phone;

  @prop()
  lga: string;

  @prop()
  // village / community
  village: string;

  @prop()
  bvn: string;
}

export class NextOfKin {
  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop()
  dob: Date;

  @prop()
  sex: Gender;

  @prop()
  relationshipWithApplicant: string;

  @prop()
  address: string;

  @prop({ type: () => Phone, _id: false })
  phone: Phone;

  @prop()
  email: string;
}

export class SecurityQuestions {
  @prop()
  hasBeenArrested: boolean;

  @prop()
  reasonForArrest: string;

  @prop()
  hasBeenBannedAsADriver: boolean;

  @prop()
  hasOutstandingDebt: boolean;

  @prop()
  isMemberOfOrganization: boolean;

  @prop({ type: () => String })
  registeredAccountPhones: string[];

  @prop({ type: () => String })
  registeredAccountEmails: string[];

  @prop()
  licenseNo: string;

  @prop()
  dateIssued: Date;
}

export class Background {
  @prop()
  educationalQualification: string;

  @prop()
  yearsOfDrivingExperience: number;

  @prop()
  hasBeenAnEHailingDriver: boolean;

  @prop()
  yearsOfEHailingExperience: number;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Biodata extends BaseEntity {
  @prop({ type: () => PersonalInfo })
  personalInfo: PersonalInfo;

  @prop({ type: () => NextOfKin })
  nextOfKin: NextOfKin;

  @prop({ type: () => SecurityQuestions })
  securityQuestions: SecurityQuestions;

  @prop({ type: () => SecurityQuestions })
  background: SecurityQuestions;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class DocumentUpload extends BaseEntity {
  @prop()
  driversLicense: string;

  @prop()
  utilityBill: string;

  @prop()
  identity: string;

  @prop()
  faceShot: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Guarantor extends BaseEntity {
  @prop()
  driversLicense: string;

  @prop()
  utilityBill: string;

  @prop()
  identity: string;

  @prop()
  faceShot: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Onboarding extends BaseEntity {
  @prop({ _id: false, type: () => Biodata })
  biodata: Biodata;

  @prop({ _id: false, type: () => DocumentUpload })
  documents: DocumentUpload;

  @prop({ ref: () => Account })
  account: Ref<Account>;
}

export default getModelForClass(Onboarding);

// "securityQuestions": {
//         "hasBeenArrested": false,
//         "reasonForArrest": "",
//         "hasBeenBannedAsADriver": "",
//         "hasOutstandingDebt": "",
//         "isMemberOfOrganization": "",
//         "registeredAccountPhones": "",
//         "registeredAccountEmails": "",
//         "licenseNo": "",
//         "dateIssued": ""
//     },
//     "background": {
//         "educationalQualification": "",
//         "yearsOfDrivingExperience": "",
//         "hasBeenAnEHailingDriver": "",
//         "yearsOfEHailingExperience": ""
//     }
