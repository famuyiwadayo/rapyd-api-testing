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
  if (!token) return next(createError("Authorization field missing", 401));
  token = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;
  try {
    let payload = await authService.validateAuthCode(token);
    if (!payload) return next(createError("Authorization failed", 401));
    req.query.userId = payload.sub;
    req.user = payload;
    next();
  } catch (err) {
    next(createStatusCodeError(err, 401));
  }
};
