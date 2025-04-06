import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { IConfig } from 'config';
import { Errors } from 'src/constants/errors';
import { CONFIG } from 'src/modules/config/config.provider';
import { UsersService } from 'src/modules/users/users.service';
import { InternalService } from '../internals/internal.service';
import { JWTDecodeValue, Payload } from './interface/auth.interface';
import { LoginResponse } from './response/login.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly internalsService: InternalService,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {}

  async validate(payload) {
    return payload;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne({
      where: {
        email,
      },
    });
    console.log('user', user);
    if (!user) throw new NotFoundException(Errors.USER_NOT_FOUND);

    const samePassword = await compare(password, user.password);
    if (!samePassword)
      throw new BadRequestException(Errors.USER_PASSWORD_IS_INCORRECT);

    return {
      sub: user.id,
      email: user.email,
    };
  }

  async validateInternalUser(email: string, password: string) {
    const user = await this.internalsService.findOne({
      where: {
        email,
      },
    });
    console.log('user', user);
    if (!user) throw new NotFoundException(Errors.USER_NOT_FOUND);

    const samePassword = await compare(password, user.password);
    if (!samePassword)
      throw new BadRequestException(Errors.USER_PASSWORD_IS_INCORRECT);

    return {
      sub: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload = await this.validateUser(email, password);
    return this.generateTokens(payload);
  }

  async internalLogin(email: string, password: string): Promise<LoginResponse> {
    const payload = await this.validateInternalUser(email, password);
    return this.generateTokens(payload);
  }

  async generateTokens(user: Payload) {
    const accessToken = this.jwtService.sign(user, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(user, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    await this.usersService.update(
      {
        id: user.sub,
      },
      { refreshToken: refreshToken },
    );

    return { user: user, accessToken, refreshToken };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<LoginResponse> {
    const user = await this.usersService.findOne({
      where: { id: userId },
    });

    if (!user || !user?.refreshToken || user?.refreshToken !== refreshToken)
      throw new ForbiddenException(Errors.FORBIDDEN);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    return tokens;
  }

  async getUserByToken(token: string) {
    const decode = this.jwtService.decode(token) as JWTDecodeValue;
    const user = await this.usersService.findOne({
      where: {
        id: decode.sub,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
