import Client from 'socket.io-client';

export type EventListener = (...args: any[]) => void;

export interface EventListenerId {
  event: string;
  listener: EventListener;
}

export class SocketIOService {
  private client = Client();

  constructor() {
    this.client.connect();
  }

  on(event: string, listener: EventListener): EventListenerId {
    this.client.on(event, listener);

    return {event, listener};
  }

  once(event: string, listener: EventListener): EventListenerId {
    this.client.once(event, listener);

    return {event, listener};
  }

  emit(event: string, ...args: any[]): void {
    this.client.emit(event, ...args);
  }

  removeListener(listenerId: EventListenerId): void {
    let {event, listener} = listenerId;

    this.client.removeListener(event, listener);
  }
}
