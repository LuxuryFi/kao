import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Student ID (references student.id)' })
  @IsInt()
  student_id: number;

  @ApiProperty()
  @IsInt()
  package_id: number;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  start_date?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status_reason?: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty()
  @IsInt()
  subscription_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status_reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    type: Number,
    description: 'UNIX timestamp (in seconds or ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  start_date?: number;
}

export class SearchSubscriptionDto {
  @ApiProperty({ required: false, description: 'Student ID (references student.id)' })
  @IsOptional()
  @IsInt()
  student_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  package_id?: number;
}
