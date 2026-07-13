import { cert, initializeApp } from 'firebase-admin/app';
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service.ts';

// @Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: () => {
        return initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      },
    },
    FirebaseService,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
