import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Injectable, Inject } from '@nestjs/common';
import type { App } from 'firebase-admin/app';

@Injectable()
export class FirebaseService {
  db: Firestore;
  auth: Auth;

  constructor(@Inject('FIREBASE_APP') app: App) {
    this.db = getFirestore(app);
    this.auth = getAuth(app);
  }

  async verifyToken(token: string) {
    return this.auth.verifyIdToken(token);
  }
}
