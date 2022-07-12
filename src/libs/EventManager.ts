import RapydBus, { RapydEventTypes } from "./Rapydbus";
import consola from "consola";

export default class EventManager extends Map<keyof RapydEventTypes, (arg: any) => void> {
  static store = new EventManager();

  static addEvent<K extends keyof RapydEventTypes>(key: K, func: (arg: RapydEventTypes[K]) => void): boolean {
    if (this.store.has(key)) this.store.delete(key);
    const em = this.store.set(key, func);

    if (em) return true;
    return false;
  }

  static removeEvent<K extends keyof RapydEventTypes>(key: K) {
    if (this.store.has(key)) return this.store.delete(key);
    return false;
  }

  static subscribeEvents() {
    this.store.forEach((func, key) => {
      RapydBus.on(key, func);
    });

    consola.log(`\x1b[33m[EventManager::Store]\x1b[0m \x1b[35m%s`, this.store.keys(), "listeners mounted\x1b[0m");
  }

  static unsubscribeEvents() {
    this.store.forEach((func, key) => {
      RapydBus.off(key, func);
    });

    consola.log(`\x1b[33m[EventManager::Store]\x1b[0m \x1b[35m%s\x1b[0m`, this.store.keys(), "listeners will be removed");
    this.store.clear();
  }
}
