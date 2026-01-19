import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Student age' })
  @Type(() => Number)
  @IsNumber()
  age: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Parent user ID (references public_user.id)' })
  @Type(() => Number)
  @IsNumber()
  parent_id: number;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStudentDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Student name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Student age', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Parent user ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parent_id?: number;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Student status: trial, active, inactive',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class SearchStudentDto {
  @ApiProperty({ description: 'Parent user ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parent_id?: number;

  @ApiProperty({ description: 'Student name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description:
      'Student status. Example values: TRIAL, ACTIVE, INACTIVE (string codes, FE can map to Vietnamese labels).',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description:
      'Trial status. One of: TRIAL_REGISTERED (đã đăng ký học thử), TRIAL_ATTENDED (đã đến học thử).',
    required: false,
  })
  @IsOptional()
  @IsString()
  trial_status?: string;
}

