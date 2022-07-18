import _Emittery from "emittery";
import { Account } from "entities";

_Emittery.isDebugEnabled = false;

export type RapydEventTypes = {
  // ACCOUNT EVENT TYPES
  "account:tested": { sub: string; roles: string[] };
  "account:created": { owner: Account };
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
  "application:payment:confirmed": { owner: string; txId: string };
};

export class _RapydBus extends _Emittery<RapydEventTypes> {
  constructor() {
    super();
  }
}

const RapydBus = new _RapydBus();
export default RapydBus;
