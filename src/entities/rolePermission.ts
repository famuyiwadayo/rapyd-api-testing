// @ts-nocheck

import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { PermissionScope } from "../valueObjects";
import { Resource } from "./resource";
import BaseEntity from "./base";
import { Role } from "./role";

/// Don't use camelCase or PascalCase for Resource naming
/// Use underscore separated names instead to make the role system work properly.
export enum AvailableResource {
  CAR = "car",
  VEHICLE = "vehicle",
  ROLE = "role",
  ACCOUNT = "account",
  ONBOARDING = "onboarding",
  COMPLAINT = "complaint",
  COMPLAINT_FEEDBACK = "complaint_feedback",
  PAYMENT_ITEM = "payment_item",
  SERVICING = "servicing",
  GUARANTOR = "guarantor",
  LOAN = "loan",
  NOTIFICATION = "notification",
  HISTORY = "history",
  REGISTRATION_REQUEST = "registration_request",
  ACTIVITY = "activity",
  ADMIN_COMMENT = "admin_comment",
}

class Scope {
  @prop({ enum: PermissionScope, _id: false, unique: false })
  name: PermissionScope;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Permission extends BaseEntity {
  @prop({ ref: () => Role })
  role: Ref<Role>;

  @prop({ ref: () => Resource })
  resource: Ref<Resource>;

  @prop({ type: () => Scope })
  scopes: Scope[];
}

export default getModelForClass(Permission);
