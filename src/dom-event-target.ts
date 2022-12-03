export class EventTarget {
  _events: Record<string, Array<(...args: any[]) => void>> = {};

  addEventListener(name: string, callback: (...args: any[]) => void): void {
    if (typeof callback !== "function") {
      return;
    }

    if (!this._events[name]) {
      this._events[name] = [];
    }
    this._events[name].push(callback);
  }

  removeEventListener(name: string, callback: (...args: any[]) => void): void {
    if (!name || !callback) {
      return;
    }

    const events = (this._events[name] || []).filter(
      (listener) => callback !== listener
    );
    if (events.length) {
      this._events[name] = events;
    } else {
      delete this._events[name];
    }
  }

  send(name: string, ...args: any[]): void {
    (this._events[name] || []).forEach((callback) =>
      callback.apply(this, args)
    );
  }
}
