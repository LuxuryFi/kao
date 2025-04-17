import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class CreateUserDto extends PickType(UserEntity, [
  'email',
  'password',
  'address',
  'phone',
  'name',
  'url',
  'status',
  'gender',
  'start_date',
  'end_date',
  'role',
]) {}

export class UpdateUserDto extends PickType(UserEntity, [
  'email',
  'address',
  'phone',
  'name',
  'url',
  'status',
  'gender',
  'start_date',
  'end_date',
  'role',
]) {}
