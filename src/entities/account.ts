// @ts-nocheck
import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Gender } from "../valueObjects";
import BaseEntity from "./base";
import { Role } from "./role";
import { Vehicle } from "./vehicle";
export class AccountControl {
  @prop({ default: false })
  enabled: boolean;
}
export class AccountLoan {
  @prop({ default: false })
  isEligible: boolean;

  @prop()
  minAmount: number;

  @prop()
  maxAmount: number;

  @prop()
  maxDuration: number;
}

export class VehicleDepositInfo {
  @prop()
  amount: number;

  @prop({ default: false })
  paid: boolean;
}
export class AccountVehicleInfo {
  @prop({ ref: () => Vehicle })
  vehicle: Ref<Vehicle>;

  @prop()
  duration: number;

  @prop({ type: VehicleDepositInfo, _id: false })
  deposit: VehicleDepositInfo;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Account extends BaseEntity {
  @prop()
  rapydId: string;

  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop()
  avatar?: string;

  @prop({ enum: Gender })
  gender: Gender;

  @prop({ trim: true, lowercase: true })
  email: string;

  @prop({ select: false })
  password: string;

  @prop()
  primaryRole?: string;

  @prop()
  phone?: string;

  @prop({ ref: () => Role })
  roles?: Ref<Role>[];

  @prop({ type: () => AccountControl, _id: false })
  control?: AccountControl;

  @prop({ default: false })
  isEmailVerified?: boolean;

  @prop({ index: true, unique: true })
  refCode: string;

  @prop({ default: false })
  isApproved: boolean;

  @prop({ type: () => AccountLoan })
  loan: AccountLoan;

  @prop({ type: () => AccountVehicleInfo, _id: false })
  vehicleInfo: AccountVehicleInfo;
}

export default getModelForClass(Account);

// isApproved, rapydId, password, control, roles, isEmailVerified, refCode, email
