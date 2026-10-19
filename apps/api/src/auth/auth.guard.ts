import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.ts';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      request.user = await this.firebase.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      const decoded = await this.firebase.verifyToken(token);
      if (decoded.role !== 'admin' && decoded.customClaims?.role !== 'admin') {
        throw new UnauthorizedException();
      }
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
