import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsGateway } from './events/events.gateway';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [EventsGateway, AppService],
})
export class AppModule {}
