import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    super({
      // get token from Header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // must match the secret key in auth.module.ts
      secretOrKey: jwtSecret,
    });
  }

  // ฟังก์ชันนี้จะทำงานอัตโนมัติถ้า Token ถูกต้อง มันจะคืนค่า payload กลับไปให้ Request
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}