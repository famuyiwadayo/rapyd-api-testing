import consola from "consola";

const catchRequest = (_: any, __: any, next: any) => {
  const err: any = new Error("Invalid endpoint");
  err.statusCode = 404;
  next(err);
};

const handleError = (err: any, req: any, res: any, _: any) => {
  // set locals, only providing error in development
  const error: any = {};
  error.message = err.message;
  // error.error = req.app.get("env") === "development" ? err : {};
  error.statusCode = err.statusCode ? err.statusCode : 500;
  //   error.status = err.status || ErrorStatus.FAILED;
  const url = req.protocol + "://" + req.get("host") + req.originalUrl;
  consola.error({
    errorUrl: url,
    message: err.message,
    statusCode: err.statusCode,
  });
  consola.error({
    stack: err.stack,
  });
  //   console.log("Sending error");
  //   Logger.error(err.message);
  res.status(error.statusCode);
  res.json(error);
};

export { catchRequest, handleError };
