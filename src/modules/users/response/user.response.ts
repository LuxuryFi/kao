import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

class BaseUserResponse {
  @IsNumber()
  @ApiProperty({ description: 'User ID' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Username' })
  username: string;

  @IsString()
  @ApiProperty({ description: 'Full name' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'Address' })
  address: string;

  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsBoolean()
  @ApiProperty({ description: 'Status (active/inactive)' })
  status: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Gender (true=male, false=female)' })
  gender: boolean;

  @IsString()
  @ApiProperty({ description: 'User type or role' })
  type: string;

  @IsString()
  @ApiProperty({ description: 'Profile picture or public URL' })
  url: string;

  @IsString()
  @ApiProperty({ description: 'Contact status', required: false })
  @IsOptional()
  contact_status?: string;
}

export class CreateUserResponse extends BaseUserResponse {}
export class GetUserResponse extends BaseUserResponse {}
export class UpdateUserResponse extends BaseUserResponse {}
