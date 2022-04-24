import { NextFunction, Response, Request } from "express";
import consola from "consola";
import { AuthService } from "../services";
import { createError, createStatusCodeError } from "../utils";

export const authGuard = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const authService = new AuthService();
  consola.info("Authenticating...");
  let token = (req.headers["x-access-token"] ||
    req.headers.authorization) as string;
  let deviceId = req.headers["device-id"] as string;
  if (!token) return next(createError("Authorization field is missing", 401));
  if (!deviceId)
    return next(createError("deviceId header field is missing", 401));
  token = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;
  try {
    let payload = await authService.validateAuthCode(token, deviceId);
    if (!payload) return next(createError("Authorization failed", 401));
    req.query.userId = payload.sub;
    req.user = payload;
    next();
  } catch (err) {
    next(createStatusCodeError(err, 401));
  }
};

export const deviceGuard = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  let deviceId = req.headers["device-id"] as string;
  if (!deviceId)
    return next(createError("deviceId header field is missing", 401));

  next();
};
