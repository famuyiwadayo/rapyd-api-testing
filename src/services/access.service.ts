import { ReturnModelType, DocumentType } from "@typegoose/typegoose";
import { createError } from "../utils";
import {
  loan,
  guarantor,
  account,
  vehicle,
  onboarding,
  vehicleColor,
  vehicleFeature,
  vehicleType,
  complaint,
  servicing,
  complaintFeedback,
} from "../entities";

import capitalize from "lodash/capitalize";
import consola from "consola";

export type SchemaTypes =
  | "loan"
  | "vehicle"
  | "guarantor"
  | "vehicleColor"
  | "vehicleFeature"
  | "vehicleType"
  | "account"
  | "complaint"
  | "onboarding"
  | "complaintFeedback"
  | "servicing";

export default class AccessService {
  static async documentBelongsToAccount(
    accountId: string,
    docId: string,
    schema: SchemaTypes,
    key?: string
  ): Promise<boolean> {
    const doc = await this.getModel(schema)
      .findById(docId)
      .select("account")
      .lean()
      .exec();
    if (!doc) throw createError(`${capitalize(schema)} not found`, 404);
    if (Boolean(String(key ? doc[key] : doc.account) !== accountId)) {
      consola.error(
        `Access denied - ${schema}_${docId} does not belong to the account_${accountId}`
      );
      throw createError("Access denied", 401);
    }
    return Boolean(String(doc.account) === accountId);
  }

  static getModel(
    schema: SchemaTypes
  ): ReturnModelType<DocumentType<any>, any> {
    const map: { [key in SchemaTypes]: DocumentType<any> } = {
      loan,
      vehicle,
      servicing,
      account,
      onboarding,
      vehicleColor,
      vehicleFeature,
      complaint,
      vehicleType,
      guarantor,
      complaintFeedback,
    };

    return map[schema];
  }
}
