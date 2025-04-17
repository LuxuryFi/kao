import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateUserResponse {
  @IsNumber()
  @ApiProperty({
    description: 'Id',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Email',
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'address',
  })
  address: string;

  @IsString()
  @ApiProperty({
    description: 'email',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'status',
  })
  status: boolean;

  @IsString()
  @ApiProperty({
    description: 'gender',
  })
  gender: boolean;

  @IsString()
  @ApiProperty({
    description: 'type',
  })
  type: string;

  @IsString()
  @ApiProperty({
    description: 'url',
  })
  url: string;
}

export class GetUserResponse {
  @IsNumber()
  @ApiProperty({
    description: 'Id',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Email',
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'address',
  })
  address: string;

  @IsString()
  @ApiProperty({
    description: 'email',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'status',
  })
  status: boolean;

  @IsString()
  @ApiProperty({
    description: 'gender',
  })
  gender: boolean;

  @IsString()
  @ApiProperty({
    description: 'type',
  })
  type: string;

  @IsString()
  @ApiProperty({
    description: 'url',
  })
  url: string;
}

export class UpdateUserResponse {
  @IsNumber()
  @ApiProperty({
    description: 'Id',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Email',
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'Name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'address',
  })
  address: string;

  @IsString()
  @ApiProperty({
    description: 'email',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'status',
  })
  status: boolean;

  @IsString()
  @ApiProperty({
    description: 'type',
  })
  type: string;

  @IsString()
  @ApiProperty({
    description: 'url',
  })
  url: string;

  @IsString()
  @ApiProperty({
    description: 'gender',
  })
  gender: boolean;
}
