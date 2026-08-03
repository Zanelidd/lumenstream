import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleDestroy } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { SimulatorService } from '../simulator/simulator.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private sub?: Subscription;

  constructor(private readonly simulator: SimulatorService) {}

  afterInit() {
    this.sub = this.simulator.measurements$.subscribe((m) =>
      this.server.emit('measurement', m),
    );
  }
  onModuleDestroy() {
    this.sub?.unsubscribe();
  }
}
