import { ReturnModelType, DocumentType } from "@typegoose/typegoose";
import { createError } from "../utils";
import {
  account,
  car,
  carColor,
  carFeature,
  complaint,
  complaintFeedback,
} from "../entities";

import capitalize from "lodash/capitalize";
import consola from "consola";

export type SchemaTypes =
  | "car"
  | "carColor"
  | "carFeature"
  | "account"
  | "complaint"
  | "complaintFeedback";

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
      car,
      account,
      carColor,
      carFeature,
      complaint,
      complaintFeedback,
    };

    return map[schema];
  }
}
