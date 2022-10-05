import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Gender } from "../valueObjects";
import { Account } from "./account";
import BaseEntity from "./base";
import { Vehicle } from "./vehicle";
import { TransactionReference } from "./transactionReference";
import { Guarantor } from "./guarantor";

export enum ApplicationStatusEnum {
  VERIFIED = "verified",
  DECLINED = "declined",
  PENDING = "pending",
}

export class Phone {
  @prop()
  home: string;

  @prop()
  work: string;
}

export class PersonalInfo {
  @prop({ type: () => Date })
  dob: string | Date;

  @prop({ enum: Gender, default: Gender.UNSPECIFIED })
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

  @prop()
  residentialState: string;

  @prop()
  residentialAddress: string;
}

export class NextOfKin {
  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop({ type: () => Date })
  dob: string | Date;

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

  @prop()
  nin: string;

  @prop()
  ninIssuanceDate: string;
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

  @prop({ type: () => Background })
  background: Background;

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
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

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
}

// @modelOptions({ schemaOptions: { timestamps: true } })
// export class Guarantor extends BaseEntity {
//   @prop()
//   name: string;

//   @prop()
//   email: string;

//   @prop()
//   document: string;

//   @prop({ type: () => Phone, _id: false })
//   phone: Phone;
// }
@modelOptions({ schemaOptions: { timestamps: true } })
export class GuarantorInfo extends BaseEntity {
  @prop({ type: () => Guarantor, _id: false })
  guarantors: Guarantor[];

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
}

export class ApplicationStatus extends BaseEntity {
  @prop({ enum: ApplicationStatusEnum })
  level1: ApplicationStatusEnum;

  @prop({ enum: ApplicationStatusEnum })
  level2: ApplicationStatusEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class PaymentInfo extends BaseEntity {
  @prop({ ref: () => TransactionReference })
  txRef: Ref<TransactionReference>;

  @prop()
  paymentRef: string;

  @prop()
  paid: boolean;

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class VehicleInfo extends BaseEntity {
  @prop({ ref: () => Vehicle })
  vehicle: Ref<Vehicle>;

  @prop()
  initialDeposit: number;

  @prop()
  duration: number; // in months

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
}
@modelOptions({ schemaOptions: { timestamps: true } })
export class HirePurchaseContract extends BaseEntity {
  @prop()
  document: string;

  @prop()
  consented: boolean;

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Onboarding extends BaseEntity {
  @prop({ _id: false, type: () => Biodata })
  biodata: Biodata;

  @prop({ _id: false, type: () => DocumentUpload })
  documents: DocumentUpload;

  @prop({ type: () => GuarantorInfo, _id: false })
  guarantorInfo: GuarantorInfo;

  @prop({ type: () => ApplicationStatus, _id: false })
  applicationStatus: ApplicationStatus;

  @prop({ type: () => HirePurchaseContract, _id: false })
  hirePurchaseContract: HirePurchaseContract;

  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  rapydId: string;

  @prop({ enum: ApplicationStatusEnum, default: ApplicationStatusEnum.PENDING })
  status: ApplicationStatusEnum;

  @prop({ type: () => PaymentInfo, _id: false })
  payment: PaymentInfo;

  @prop({ type: () => VehicleInfo, _id: false })
  vehicleInfo: VehicleInfo;

  @prop()
  rejectionReason: string;

  @prop()
  canReapply: boolean;
}

export default getModelForClass(Onboarding);

/// ONBOARDING BIODATA REQUEST.
// {
//     "personalInfo": {
//         "dob": "1994-07-09",
//         "sex": "male",
//         "maritalStatus": "single",
//         "stateOfOrigin": "oyo",
//         "phone": {
//             "home": "0000000000",
//             "work": "0000000000"
//         },
//         "lga": "ikeja",
//         "village": "ikeja",
//         "bvn": "00000000000"
//     },
//     "nextOfKin": {
//         "firstName": "Ayo",
//         "lastName": "Umaru",
//         "dob": "2000-07-09",
//         "sex": "male",
//         "relationshipWithApplicant": "brother",
//         "address": "407 Rue",
//         "phone": {
//             "home": "0000000000",
//             "work":"0000000000"
//         },
//         "email": "ayo@gmail.com"
//     },
//     "securityQuestions": {
//         "hasBeenArrested": false,
//         "reasonForArrest": null,
//         "hasBeenBannedAsADriver": false,
//         "hasOutstandingDebt": false,
//         "isMemberOfOrganization": false,
//         "registeredAccountPhones": ["0000000000", "0000000000"],
//         "registeredAccountEmails": ["a@gmail.com", "b@gmail.com"],
//         "licenseNo": "A089123423",
//         "dateIssued": "2019-04-24"
//     },
//     "background": {
//         "educationalQualification": "Bsc",
//         "yearsOfDrivingExperience": "5",
//         "hasBeenAnEHailingDriver": true,
//         "yearsOfEHailingExperience": "10"
//     }
// }
