import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class BaseStudentResponse {
  @IsNumber()
  @ApiProperty({ description: 'Student ID' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Student name' })
  name: string;

  @IsNumber()
  @ApiProperty({ description: 'Student age' })
  age: number;

  @IsString()
  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  phone?: string;

  @IsNumber()
  @ApiProperty({ description: 'Parent user ID' })
  parent_id: number;

  @IsString()
  @ApiProperty({ description: 'Student status: trial, active, inactive' })
  status: string;

  @IsString()
  @ApiProperty({ description: 'Trial status', required: false, enum: ['TRIAL_REGISTERED', 'TRIAL_ATTENDED'] })
  @IsOptional()
  trial_status?: string;

  @IsString()
  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  description?: string;

  @IsNumber()
  @ApiProperty({ description: 'Created timestamp' })
  @IsOptional()
  created_at?: number;

  @ApiProperty({ description: 'Updated date' })
  @IsOptional()
  updated_date?: Date;
}

export class CreateStudentResponse extends BaseStudentResponse {}
export class GetStudentResponse extends BaseStudentResponse {}
export class UpdateStudentResponse extends BaseStudentResponse {}

