import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date: Date;

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

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @ApiProperty()
  @IsString()
  role: string;
}
