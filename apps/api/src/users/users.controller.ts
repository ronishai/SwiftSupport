import {
  Body,
  Get,
  Post,
  Controller,
  UseGuards,
  Delete,
  Req,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service.ts';
import { FirebaseAuthGuard, AdminGuard } from '../auth/auth.guard.ts';
import { CreateAdminDto } from './dto/create-admin.dto.ts';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  findAll() {
    return this.users.findAll();
  }

  @Post('create-admin')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  createAdmin(@Body(new ValidationPipe()) createAdminDto: CreateAdminDto) {
    return this.users.createAdmin(createAdminDto);
  }

  @Post('set-admin')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  setAdmin(@Body('uid') uid: string) {
    return this.users.setAdmin(uid);
  }

  @Post('set-team')
  @UseGuards(FirebaseAuthGuard)
  setTeam(
    @Body('team') team: string,
    @Body('displayName') displayName: string | undefined,
    @Req() req: any,
  ) {
    const uid = req.user?.uid;
    return this.users.setTeam(uid, team, displayName);
  }

  @Delete(':uid')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  remove(@Param('uid') uid: string) {
    return this.users.remove(uid);
  }
}
