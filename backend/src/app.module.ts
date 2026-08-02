import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsGateway } from './events/events.gateway';
import { AppService } from './app.service';
import { SimulatorService } from './simulator/simulator.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [EventsGateway, AppService, SimulatorService],
})
export class AppModule {}
