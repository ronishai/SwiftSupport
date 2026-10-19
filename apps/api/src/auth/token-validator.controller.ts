import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.ts';

@Controller('auth')
export class TokenValidatorController {
  constructor(private firebase: FirebaseService) {}

  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    if (!token) throw new UnauthorizedException();
    const docPath = process.env.QR_TOKEN_DOC_PATH || 'Config/qr-token';
    const snap = await this.firebase.db.doc(docPath).get();
    if (snap.data()?.value !== token) throw new ForbiddenException();
    return { valid: true };
  }
}
