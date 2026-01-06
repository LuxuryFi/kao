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
}

