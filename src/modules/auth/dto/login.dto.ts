import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class LoginDto extends PickType(UserEntity, [
  'email',
  'password',
]) {}
