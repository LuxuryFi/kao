import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export interface RequestUser {
  sub: string;
  refreshToken?: string;
}

export const User = createParamDecorator<
  keyof UserEntity,
  ExecutionContext,
  any
>((key, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as UserEntity;
  return key ? user[key] : user;
});
