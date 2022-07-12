// @ts-nocheck

import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { RapydEventTypes } from "../libs";
import { Account } from "./account";
import BaseEntity from "./base";
import { Loan } from "./loan";
import { Vehicle } from "./vehicle";

export enum NotificationType {
    
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Notification extends BaseEntity {
  @prop()
  message: string;

  @prop()
  display: boolean;

  // @prop({ enum: NotificationType })
  // type: NotificationType;

  @prop({type: () => String})
  event: keyof RapydEventTypes

  @prop()
  [key: string]: any;

  @prop({ref: () => Account})
  owner: Ref<Account>;

  @prop({ref: () => Account})
  modifier: Ref<Account>;

  @prop({ refPath: "onModel" })
  item: Vehicle | Account | Loan;

  @prop({ type: String, required: false, enum: ["Vehicle", "Loan"] })
  onModel: "Vehicle" | "Loan" | "Account";

  @prop({default: false})
  isRead: boolean;

  @prop({default: false})
  isAdmin: boolean;

  @prop()
  resource: 'account' | 'loan' | 'vehicle' | 'guarantor' | 'complaint' | 'servicing' | 'transaction' | 'finance' | 'onboarding'
}

export default getModelForClass(Notification);
