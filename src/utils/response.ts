import { Response } from "express";
import consola from "consola";
import { ErrorStatus } from "./error";

export const sendResponse = (
  res: Response,
  statusCode: number,
  result: any,
  message?: string
): void => {
  result = result || { statusCode: 204, status: "success" };
  if (typeof result !== "object") result = result.toObject();
  result = { data: result };
  result.statusCode = result.statusCode || statusCode;
  result.status = ErrorStatus.SUCCESS;
  result.messsage = message;
  res.header("Cache-Control", "no-cache,no-supplier,must-revalidate");
  res.status(result.statusCode || statusCode || 200);
  res.json(result);
  consola
    .withTag(result.statusCode || statusCode || 200)
    .success(`Sent Response`);
  console.log("\n");
};
