declare module "dom-event-target" {

  export default class EventTarget {
    constructor();
  
    addEventListener(event: string, callback: (...args: any[]) => void): void;
  
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
    
    send(name: string, ...args: any[]): void;
  }  
}
