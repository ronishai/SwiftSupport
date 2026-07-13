import { Module } from '@nestjs/common';
import { FirebaseAuthGuard, AdminGuard } from './auth.guard.ts';
import { TokenValidatorController } from './token-validator.controller.ts';
import { FirebaseModule } from '../firebase/firebase.module.ts';

@Module({
  imports: [FirebaseModule],
  providers: [FirebaseAuthGuard, AdminGuard],
  controllers: [TokenValidatorController],
  exports: [FirebaseAuthGuard, AdminGuard],
})
export class AuthModule {}
