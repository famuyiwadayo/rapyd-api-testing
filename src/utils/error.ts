import { NextFunction } from "express";
import { StatusCodeError } from "request-promise/errors";

export const sendError = (err: Error, next: NextFunction) => {
  const error: any = new Error(
    err ? err.message : "A server error just occurred"
  );
  error.statusCode =
    err && (err as any).statusCode ? (err as any).statusCode : 500;
  error.status = (err as any).status || ErrorStatus.FAILED;
  next(error);
};

export const createError = (
  message?: string,
  statusCode?: number,
  status?: ErrorStatus
): Error => {
  const error: any = new Error(message || "An unknown error has occurred");
  error.statusCode = statusCode || 500;
  error.status = status || ErrorStatus.FAILED;
  return error;
};

export const createStatusCodeError = (err: any, statusCode?: number): Error => {
  // console.error('Creating status code error: ', err);
  if (err instanceof StatusCodeError)
    return createError(err.error.message, statusCode || err.error.statusCode);
  else return createError(err.message, statusCode || err.statusCode);
};

export enum ErrorStatus {
  SUCCESS = "success",
  FAILED = "failed",
}
