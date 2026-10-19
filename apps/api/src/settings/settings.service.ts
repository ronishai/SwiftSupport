import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.ts';
import {
  AppSettings,
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_RESPONSIBLE_TEAMS,
  DEFAULT_TEAMS,
} from '@swift-support/shared';

const SETTINGS_DOC = 'appConfig';
const SETTINGS_COLLECTION = 'settings';

@Injectable()
export class SettingsService {
  constructor(private firebase: FirebaseService) {}

  private settingsRef() {
    return this.firebase.db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
  }

  async getConfig(): Promise<AppSettings> {
    const snapshot = await this.settingsRef().get();
    if (!snapshot.exists) {
      return {
        categories: DEFAULT_CATEGORIES,
        teams: DEFAULT_TEAMS,
        categoryResponsibleTeams: DEFAULT_CATEGORY_RESPONSIBLE_TEAMS,
      };
    }

    const data = snapshot.data() as Partial<AppSettings>;
    return {
      categories: data.categories ?? DEFAULT_CATEGORIES,
      teams: data.teams ?? DEFAULT_TEAMS,
      categoryResponsibleTeams:
        data.categoryResponsibleTeams ?? DEFAULT_CATEGORY_RESPONSIBLE_TEAMS,
    };
  }

  async updateConfig(settings: Partial<AppSettings>) {
    await this.settingsRef().set(settings, { merge: true });
    return this.getConfig();
  }
}
