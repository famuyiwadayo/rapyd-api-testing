import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { Account } from "./account";
import BaseEntity from "./base";
// import { Phone } from "./onboarding";

export enum GuarantorVerificationStatus {
  VERIFIED = "verified",
  REJECTED = "rejected",
  PENDING = "pending",
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Guarantor extends BaseEntity {
  @prop()
  name: string;

  @prop({ ref: () => Account })
  account: Ref<Account>;

  @prop()
  email: string;

  @prop({ type: () => String })
  documents: string[];

  @prop()
  signedLetter: string;

  @prop({ type: () => String })
  phone: string[];

  @prop()
  workAddress: string;

  @prop()
  homeAddress: string;

  @prop()
  nameOfApplicant: string;

  @prop()
  howLongSinceKnownTheApplicant: string;

  @prop()
  relationshipWithApplicant: string;

  @prop()
  token: string;

  @prop({ default: false })
  used?: boolean;

  @prop()
  expiry?: number;

  @prop()
  attempts: number;

  @prop({ enum: GuarantorVerificationStatus, default: GuarantorVerificationStatus.PENDING })
  status: GuarantorVerificationStatus;
}

export default getModelForClass(Guarantor);
