// import * as Sentry from "@sentry/node";
// //@ts-ignore
// import * as Tracing from "@sentry/tracing";

import express from "express";
import { mongoose } from "@typegoose/typegoose";
import cors from "cors";
import helmet from "helmet";
import config from "./src/config";
import Routes from "./src/routes";
import {
  logRequests,
  catchRequest,
  handleError,
  compressor,
} from "./src/middlewares";
import { AuthPayload } from "./src/interfaces/ros";
import SystemService from "./src/services/system.service";

declare global {
  namespace Express {
    interface Request {
      user: AuthPayload;
    }
  }
}

// setup express app
const app = express();

// Sentry.init({
//   release: "nu-identity-service@" + process.env.npm_package_version,
//   dsn: "https://9a70d9178ff4431eb057c4cabd7bd2cc@o945368.ingest.sentry.io/5894012",
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//     new Tracing.Integrations.Express({ app }),
//     new Tracing.Integrations.Mongo(),
//   ],
//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });

app.set("trust proxy", 1);

// setup middlewares

// The request/tracing handler must be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(helmet());
app.use(compressor());
app.use(express.json());

app.use(logRequests);

// setup routes
app.use("/v1", Routes);
app.get("/", (_, res) =>
  res.status(200).json({
    name: config.NAME,
    type: "API Service",
    version: config.VERSION,
  })
);

// catch 404 and forward to error handler
app.use(catchRequest);
app.use(handleError);

// run and listen to server procs
const run = async () => {
  try {
    await mongoose.connect(config.DB_URI, {});
    new SystemService().ensureSystemServices();
    console.log("\n🐕‍🦺 db connected!");
  } catch (error) {
    console.error(error);
  }

  app.listen(config.PORT, () => {
    // app.use(Sentry.Handlers.errorHandler());
    process.on("uncaughtException", async (error) => {
      console.log("An Uncaught exception has occurred", error);
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("A SIG-INT has occurred");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("A SIG-TERM has occurred");

      process.exit(0);
    });
    console.log(
      `🚀 ${config.NAME} service::v${config.VERSION} listening on http://localhost:${config.PORT}`
    );
  });
};

run();
