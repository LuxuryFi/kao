import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsBoolean()
  gender: boolean;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsNumber()
  @IsOptional()
  start_date: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsNumber()
  @IsOptional()
  end_date: number;

  @ApiProperty()
  @IsString()
  role: string;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsBoolean()
  gender: boolean;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsNumber()
  start_date: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsNumber()
  end_date: number;

  @ApiProperty()
  @IsString()
  role: string;
}
