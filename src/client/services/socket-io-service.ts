import Client from 'socket.io-client';

export class SocketIOService {
  private client = Client();

  constructor() {
    this.client.connect();
  }
}
