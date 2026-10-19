import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service.ts';
import { SettingsController } from './settings.controller.ts';
import { FirebaseModule } from '../firebase/firebase.module.ts';

@Module({
  imports: [FirebaseModule],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
