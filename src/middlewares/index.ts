import consola from "consola";
import { NextFunction, Request, Response } from "express";
export { catchRequest, handleError } from "./catchInvalidRequests";
export { authGuard } from "./guards";
export { default as compressor } from "./compression";

export const logRequests = (req: Request, _: Response, next: NextFunction) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const url = req.protocol + "://" + req.get("host") + req.originalUrl;
  const contentType = req.get("Content-Type");
  console.log("\n");
  consola.info(
    `${ip} calling ${req.method} ${url} Content type: ${contentType}`
  );
  next();
};
