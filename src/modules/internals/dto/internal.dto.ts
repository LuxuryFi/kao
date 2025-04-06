import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class CreateUserDto extends PickType(UserEntity, [
  'email',
  'password',
  'type',
  'address',
  'phone',
  'name',
  'url',
  'status',
  'created_at',
  'gender',
]) {}

export class UpdateUserDto extends PickType(UserEntity, [
  'email',
  'type',
  'address',
  'phone',
  'name',
  'url',
  'status',
  'gender',
]) {}
