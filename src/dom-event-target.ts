export class EventTarget {
  _events: Record<string, Array<(...args: any[]) => void> | undefined> = {};

  addEventListener(name: string, callback: (...args: any[]) => void): void {
    if (typeof callback !== "function") {
      return;
    }

    let arr = this._events[name];
    if (!arr) {
      arr = [];
      this._events[name] = arr;
    }
    arr.push(callback);
  }

  removeEventListener(name: string, callback: (...args: any[]) => void): void {
    if (!name) {
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

  send(name: string, ...args: any[]): void {
    (this._events[name] || []).forEach(callback => callback.apply(this, args));
  }
}
