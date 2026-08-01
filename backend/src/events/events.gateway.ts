import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit() {
    let count = 0;
    setInterval(() => {
      this.server.emit('measurement', {
        count: count++,
        value: Number((100 + Math.random() * 10 - 5).toFixed(2)),
        timestamp: Date.now(),
      });
    }, 1000);
    console.log('WebSocket gateway ready, emission started.');
  }
  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
