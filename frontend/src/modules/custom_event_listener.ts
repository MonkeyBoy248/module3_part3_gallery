export interface CustomEventListener {
  target: HTMLElement | Window | Document;
  type: string;
  handler: EventListenerOrEventListenerObject;
}

export class ListenerRemover {
  static removeEventListeners (listeners: CustomEventListener[]) {
    for (let listener of listeners) {
      listener.target.removeEventListener(listener.type, listener.handler);
    }
  }
}
