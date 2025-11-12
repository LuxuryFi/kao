import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
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
  @IsOptional()
  start_date: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsNumber()
  @IsOptional()
  end_date: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Sale id', required: false })
  @IsOptional()
  @IsNumber()
  sale_id?: number;

  @ApiProperty({ description: 'Status reason code', required: false })
  @IsOptional()
  @IsNumber()
  status_reason?: number;
}

export class UpdateCustomerDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
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
  @IsOptional()
  @IsNumber()
  start_date: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
  })
  @IsOptional()
  @IsNumber()
  end_date: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Sale id', required: false })
  @IsOptional()
  @IsNumber()
  sale_id?: number;

  @ApiProperty({ description: 'Status reason code', required: false })
  @IsOptional()
  @IsNumber()
  status_reason?: number;
}

export class ConvertCustomerToUserDto {
  @ApiProperty({ description: 'Customer ID to convert' })
  @IsNumber()
  customer_id: number;

  @ApiProperty({ description: 'Password for the new user account' })
  @IsString()
  password: string;
}

