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

  private measSub?: Subscription;
  private alertSub?: Subscription;

  constructor(private readonly simulator: SimulatorService) {}

  afterInit() {
    this.measSub = this.simulator.measurements$.subscribe((m) =>
      this.server.emit('measurement', m),
    );

    this.alertSub = this.simulator.alert$.subscribe((a) =>
      this.server.emit('alert', a),
    );
  }

  onModuleDestroy() {
    this.measSub?.unsubscribe();
    this.alertSub?.unsubscribe();
  }
}
