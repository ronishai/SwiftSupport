import { Module } from '@nestjs/common';
import { UsersService } from './users.service.ts';
import { UsersController } from './users.controller.ts';
import { FirebaseModule } from '../firebase/firebase.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [FirebaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
