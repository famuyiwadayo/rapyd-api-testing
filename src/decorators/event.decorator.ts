import { RapydEventTypes, EventManager } from "../libs";
// import consola from "consola";

// ------------------------------------------- Decorators ---------------------------------------//
export function addEvent(key: keyof RapydEventTypes) {
  return function (_: any, __: string, descriptor: PropertyDescriptor) {
    EventManager.addEvent(key, descriptor.value);
    // consola.info(`Registered \x1b[33m%s\x1b[0m event listener ✅`, `${target.name}.${propertyKey}`);
  };
}
