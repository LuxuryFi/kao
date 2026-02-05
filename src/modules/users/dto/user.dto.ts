import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CONTACT_STATUS } from 'src/constants/contact-status';
import { ALLOWED_ROLES } from 'src/constants/roles';

export class CreateUserDto {
  @ApiProperty({
    required: false,
    description: 'Username (required for all roles except customer)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    required: false,
    description: 'Password (required for all roles except customer)',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf(
    (o) => o.email !== '' && o.email !== null && o.email !== undefined,
  )
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Name (required for customer role, optional for others)',
  })
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
    description: `Role of user. Allowed values: ${ALLOWED_ROLES.join(', ')}`,
  })
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

  @ApiProperty({
    description:
      'Contact status. One of: ' + Object.values(CONTACT_STATUS).join(', '),
    required: false,
    enum: Object.values(CONTACT_STATUS),
  })
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
  @ValidateIf(
    (o) => o.email !== '' && o.email !== null && o.email !== undefined,
  )
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

  @ApiProperty({
    description:
      'Contact status. One of: ' + Object.values(CONTACT_STATUS).join(', '),
    required: false,
    enum: Object.values(CONTACT_STATUS),
  })
  @IsOptional()
  @IsString()
  contact_status?: string;
}
