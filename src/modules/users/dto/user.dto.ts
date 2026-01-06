import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: false, description: 'Username (required for all roles except customer)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false, description: 'Password (required for all roles except customer)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Name (required for customer role, optional for others)' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gender?: boolean;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  start_date?: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  end_date?: number;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty({ description: 'Phone number (required for customer role)' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Parent user id', required: false })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiProperty({ description: 'Status reason code', required: false })
  @IsOptional()
  @IsNumber()
  status_reason?: number;

  @ApiProperty({ description: 'Contact status', required: false })
  @IsOptional()
  @IsString()
  contact_status?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: 'New password' })
  @IsString()
  new_password: string;
}

export class AdminUpdatePasswordDto {
  @ApiProperty({ description: 'User ID to update password' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'New password' })
  @IsString()
  new_password: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gender?: boolean;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  start_date?: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  end_date?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Parent user id', required: false })
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @ApiProperty({ description: 'Status reason code', required: false })
  @IsOptional()
  @IsNumber()
  status_reason?: number;

  @ApiProperty({ description: 'Contact status', required: false })
  @IsOptional()
  @IsString()
  contact_status?: string;
}
