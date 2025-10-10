import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  course_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  summary: string;

  @ApiProperty({ description: 'JSON string { day: [2,3,4], hour: "14:00" }' })
  @IsString()
  schedule: string;

  @ApiProperty({ description: 'Court ID this course belongs to' })
  @IsNumber()
  court_id: number;
}

export class UpdateCourseDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsString()
  course_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  summary: string;

  @ApiProperty({ description: 'JSON string { day: [2,3,4], hour: "14:00" }' })
  @IsString()
  schedule: string;

  @ApiProperty({ description: 'Court ID this course belongs to' })
  @IsNumber()
  court_id: number;
}

export class DeleteCourseDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;
}


