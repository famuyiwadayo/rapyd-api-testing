// @ts-nocheck

import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";

export enum EVerificationStatus {
  VERIFIED = "verified",
  PENDING = "pending",
  REJECTED = "rejected",
}

@modelOptions({ schemaOptions: { timestamps: true } })
class NinMatch extends BaseEntity {
  @prop()
  ninValue: string;

  @prop()
  firstname: boolean;

  @prop()
  lastname: boolean;

  @prop()
  nin: boolean;

  @prop()
  dob: boolean;

  @prop()
  gender: boolean;

  @prop({ enum: EVerificationStatus })
  status: EVerificationStatus;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class LicenseMatch extends BaseEntity {
  @prop()
  licenseNoValue: string;

  @prop()
  firstname: boolean;

  @prop()
  lastname: boolean;

  @prop()
  licenseNo: boolean;

  @prop()
  dob: boolean;

  @prop()
  gender: boolean;

  @prop({ enum: EVerificationStatus })
  status: EVerificationStatus;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class BvnMatch extends BaseEntity {
  @prop()
  bvnValue: string;

  @prop()
  firstname: boolean;

  @prop()
  lastname: boolean;

  @prop()
  bvn: boolean;

  @prop({ enum: EVerificationStatus })
  status: EVerificationStatus;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class AddressMatch extends BaseEntity {
  @prop()
  firstname: boolean;

  @prop()
  lastname: boolean;

  @prop()
  state: boolean;

  @prop()
  lga: boolean;

  @prop({ enum: EVerificationStatus })
  status: EVerificationStatus;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class VerificationStatus extends BaseEntity {
  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop({ type: BvnMatch })
  bvn: BvnMatch;

  @prop({ type: NinMatch })
  nin: NinMatch;

  @prop({ type: LicenseMatch })
  driversLicense: LicenseMatch;

  @prop({ type: AddressMatch })
  address: AddressMatch;
}

export default getModelForClass(VerificationStatus);
