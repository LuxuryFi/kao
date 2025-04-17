import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IConfig } from 'config';
import { ConfigModule } from '../config/config.module';
import { CONFIG, getHost } from '../config/config.provider';
import { UserModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [CONFIG],
      useFactory: async (config: IConfig) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          issuer: getHost(),
        },
      }),
    }),
    HttpModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
