import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller.ts';
import { TicketService } from './tickets.service.ts';
import { FirebaseModule } from '../firebase/firebase.module.ts';
import { SettingsModule } from '../settings/settings.module.ts';

@Module({
  controllers: [TicketsController],
  providers: [TicketService],
  imports: [FirebaseModule, SettingsModule],
})
export class TicketsModule {}
