// @ts-nocheck

import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { PermissionScope } from "../valueObjects";
import { Resource } from "./resource";
import BaseEntity from "./base";
import { Role } from "./role";

export enum AvailableResource {
  ACCOUNT = "account",
  ROLE = "role",
  ONBOARDING = "onboarding",
  VOTE = "vote",
  EARNING = "earning",
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
