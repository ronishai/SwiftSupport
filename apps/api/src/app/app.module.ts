import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module.ts';
import { AuthModule } from '../auth/auth.module.ts';
import { TicketsModule } from '../tickets/tickets.module.ts';
import { FirebaseModule } from '../firebase/firebase.module.ts';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from '../notifications/notifications.module.ts';
import { SettingsModule } from '../settings/settings.module.ts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    EventEmitterModule.forRoot(),
    FirebaseModule,
    UsersModule,
    AuthModule,
    TicketsModule,
    NotificationsModule,
    SettingsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
})
export class AppModule {}
