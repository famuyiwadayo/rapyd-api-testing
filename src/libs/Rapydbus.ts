import _Emittery from "emittery";
import { Account, Guarantor } from "../entities";

_Emittery.isDebugEnabled = false;

export type RapydEventTypes = {
  // ACCOUNT EVENT TYPES
  "account:tested": { sub: string; roles: string[] };
  "account:created": { owner: Account };
  "account:logged_in": { owner: Account };
  "account:verified": { owner: Account };
  "account:bank:added": { owner: string };
  "account:bank:removed": { owner: Account };
  "account:password:changed": { owner: Account };
  "account:deleted": { owner: Account; modifier: Account | string };
  "account:enabled": { owner: Account; modifier: Account | string };
  "account:disabled": { owner: Account; modifier: Account | string };
  "account:password:reset": { owner: Account };
  "account:vehicle:status:updated": { owner: Account; modifier: Account | string };

  // APPLICATION EVENT TYPES
  "application:payment:initiated": { owner: string };
  "application:approved": { owner: string; modifier: string };
  "application:declined": { owner: string; modifier: string };
  "application:underReview": { owner: string };
  "application:payment:confirmed": { owner: string; txId: string };

  // ADMIN COMMENT EVENT TYPES
  "adminComment:created": { creator: string; account: string };
  "adminComment:updated": { creator: string; account: string };
  "adminComment:resolved": { resolver: string; account: string };
  "adminComment:deleted": { creator: string; account: string };

  // GUARANTOR EVENT TYPES
  "guarantor:added": { account: string; guarantor: Guarantor };
  "guarantor:deleted": { account: string; guarantorId: string };
  "guarantor:verified": { account: string; guarantor: Guarantor };
  "guarantor:rejected": { account: string; guarantor: Guarantor };
  "guarantor:form:attempted": { account: string; guarantor: Guarantor };

  // SERVICING EVENT TYPES
  "servicing:created": { account: string; date: Date; location: string };

  // LOAN EVENT TYPES
  "loan:paid": { account: string };
  "loan:request": { account: string };
  "loan:repayment": { account: string; amount: number };
  "loan:approved": { account: string; modifier: string };
  "loan:declined": { account: string; modifier: string };

  // FINANCE EVENT TYPES
  "finance:initialPayment": { account: string; amount: number };
  "finance:weeklyPayment": { account: string; amount: number };
};

export class _RapydBus extends _Emittery<RapydEventTypes> {
  constructor() {
    super();
  }
}

const RapydBus = new _RapydBus();
export default RapydBus;
