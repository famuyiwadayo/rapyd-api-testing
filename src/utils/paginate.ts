import { IPaginationFilter, PaginatedDocument } from "../interfaces/ros";
import AccessService, { SchemaTypes } from "../services/access.service";
import {QueryOptions} from 'mongoose'
import { DocumentType } from "@typegoose/typegoose";

const defaultFilters = { limit: "10", page: "1" };

export default async function paginate<T>(
  schemaType: SchemaTypes,
  query: any = {},
  filters: IPaginationFilter = defaultFilters,
  options?: QueryOptions<DocumentType<any>>
): Promise<PaginatedDocument<T>> {
  filters = { ...defaultFilters, ...filters };
  const model = AccessService.getModel(schemaType);

  const skip = Math.abs(
    (Math.max(parseInt(filters?.page!), 1) - 1) * parseInt(filters?.limit!)
  );

  // console.log("SKIP", filters, skip);

  const res = await Promise.all([
    model.countDocuments(query).exec(),
    model
      .find(query, null, options)
      .lean()
      .sort({ createdAt: -1 })
      .limit(Math.abs(parseInt(filters?.limit!)))
      .skip(skip)
      .exec(),
  ]);

  return { totalCount: res[0], data: res[1] };
}
