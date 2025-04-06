import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IConfig } from 'config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG } from 'src/modules/config/config.provider';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(CONFIG) private readonly configService: IConfig,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request) {
    const token = req.get('Authorization').replace('Bearer', '').trim();
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      return this.authService.getUserByToken(token);
    } catch (error) {}
  }
}
