// @ts-nocheck

import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import BaseEntity from "./base";
// import { Permission } from "./rolePermission";

export enum AvailableRole {
  SUPERADMIN = "superadmin", // Has access to all the features on the admin
  MODERATOR = "moderator",
  DRIVER = "driver",
  ACCOUNTS_ADMIN = "accounts_admin", // Has access to payments, loans, applicants and driver's profile
  FLEET_MANAGER = "fleet_manager", // Fleet Managers: has access to everything except payments and loans
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class Role extends BaseEntity {
  @prop({ unique: true, lowercase: true })
  name: string;

  @prop({ index: true, unique: true })
  slug?: string;
}

export default getModelForClass(Role);
