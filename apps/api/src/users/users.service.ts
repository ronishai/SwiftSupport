import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.ts';
import { CreateAdminDto } from './dto/create-admin.dto.ts';
import { FirebaseError } from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(private firebase: FirebaseService) {}

  async findAll() {
    const result = await this.firebase.auth.listUsers();
    return result.users.map((user) => ({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: user.customClaims?.['role'] || null,
      team: user.customClaims?.['team'] || null,
    }));
  }

  async createAdmin(dto: CreateAdminDto) {
    try {
      const user = await this.firebase.auth.createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.displayName,
      });

      await this.firebase.auth.setCustomUserClaims(user.uid, {
        role: 'admin',
        team: dto.team,
      });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        team: dto.team,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof (error as Record<string, unknown>).code === 'string'
      ) {
        const firebaseError = error as FirebaseError;

        if (firebaseError.code === 'auth/email-already-exists') {
          throw new BadRequestException('כתובת האימייל הזו כבר קיימת במערכת');
        }
      }

      throw new InternalServerErrorException('שגיאה פנימית ביצירת מנהל');
    }
  }

  async setAdmin(uid: string) {
    const userRecord = await this.firebase.auth.getUser(uid);
    const existingClaims = userRecord.customClaims || {};

    await this.firebase.auth.setCustomUserClaims(uid, {
      ...existingClaims,
      role: 'admin',
    });
    return { ok: true };
  }

  async setTeam(uid: string, team: string, displayName?: string) {
    const userRecord = await this.firebase.auth.getUser(uid);
    const existing = userRecord.customClaims || {};

    await this.firebase.auth.setCustomUserClaims(uid, {
      ...existing,
      role: 'admin',
      team,
    });

    if (displayName) {
      await this.firebase.auth.updateUser(uid, { displayName });
    }

    return { ok: true };
  }

  async remove(uid: string) {
    await this.firebase.auth.deleteUser(uid);
    return { ok: true };
  }
}
