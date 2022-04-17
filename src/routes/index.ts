// import AccountRouter from "./account.routes";
// import AuthRouter from "./auth.routes";
// import RoleRouter from "./role.routes";
// import EmailRouter from "./email.routes";
// import CoinRouter from "./coin.routes";
// import VoteRouter from "./vote.routes";
// import EarningRouter from "./earning.routes";
// import MarketCapRouter from "./marketCap.routes";
// import RegistrationRequestRouter from "./registrationRequest.routes";

import { Router } from "express";

import { sendResponse } from "../utils";

const routes = Router();

// routes.use("/accounts", AccountRouter);
// routes.use("/auth", AuthRouter);
// routes.use("/roles", RoleRouter);
// routes.use("/emails", EmailRouter);
// routes.use("/coins", CoinRouter);
// routes.use("/votes", VoteRouter);
// routes.use("/earnings", EarningRouter);
// routes.use("/marketcap", MarketCapRouter);

// routes.use("/registrations", RegistrationRequestRouter);

routes.get("/healthcheck", (_, res, __) => {
  sendResponse(res, 200, { message: "OK" });
});

export default routes;
