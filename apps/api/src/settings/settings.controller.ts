import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.ts';
import { FirebaseAuthGuard, AdminGuard } from '../auth/auth.guard.ts';
import { AppSettings } from '@swift-support/shared';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('public')
  getPublicSettings() {
    return this.settingsService.getConfig();
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  getSettings() {
    return this.settingsService.getConfig();
  }

  @Patch()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  updateSettings(@Body() settings: Partial<AppSettings>) {
    return this.settingsService.updateConfig(settings);
  }
}
