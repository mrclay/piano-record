export class EventTarget<T = Record<string, any>> {
  _events: Partial<{
    [K in keyof T]: Array<(arg: T[K]) => void>;
  }> = {};

  addEventListener<K extends keyof T>(
    name: K,
    callback: (arg: T[K]) => void
  ): void {
    if (typeof callback !== "function") {
      return;
    }

    const listeners = this._events[name] || [];
    this._events[name] = listeners;

    listeners.push(callback);
  }

  removeEventListener<K extends keyof T>(
    name: K,
    callback: (arg: T[K]) => void
  ): void {
    if (!name || !callback) {
      return;
    }

    const events = (this._events[name] || []).filter(
      listener => callback !== listener
    );
    if (events.length) {
      this._events[name] = events;
    } else {
      delete this._events[name];
    }
  }

  send<K extends keyof T>(name: K, arg: T[K]): void {
    (this._events[name] || []).forEach(callback => callback.apply(this, [arg]));
  }
}
