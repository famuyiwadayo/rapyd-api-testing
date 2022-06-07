import crypto from "crypto";
import { Router } from "express";

import AuthRouter from "./auth.routes";
import RoleRouter from "./role.routes";
import AccountRouter from "./account.routes";
import PaymentRouter from "./payment.routes";
import VehicleRouter from "./vehicle.routes";
import ComplaintRouter from "./complaint.routes";
import OnboardingRouter from "./onboarding.routes";
import FinanceRouter from "./finance.routes";
import ServicingRouter from "./servicing.routes";
import LoanRouter from "./loan.routes";
// import EmailRouter from "./email.routes";
// import RegistrationRequestRouter from "./registrationRequest.routes";

import { sendResponse } from "../utils";
import config from "../config";
import { PaymentService } from "../services";

const routes = Router();

routes.use("/auth", AuthRouter);
routes.use("/roles", RoleRouter);
routes.use("/loans", LoanRouter);
routes.use("/accounts", AccountRouter);
routes.use("/vehicles", VehicleRouter);
routes.use("/payments", PaymentRouter);
routes.use("/onboarding", OnboardingRouter);
routes.use("/complaints", ComplaintRouter);
routes.use("/complaints", ComplaintRouter);
routes.use("/finances", FinanceRouter);
routes.use("/services", ServicingRouter);

// routes.use("/registrations", RegistrationRequestRouter);

routes.get("/healthcheck", (_, res, __) => {
  sendResponse(res, 200, { message: "OK" });
});

routes.post("/webhook", async (req, res, _) => {
  //validate event
  const hash = crypto
    .createHmac("sha512", config.PAYSTACK_AUTHORIZATION)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    // console.log(req.body);
    await PaymentService.checkTransactionApproved(req.body);
  }

  sendResponse(res, 200, {});
});

export default routes;
