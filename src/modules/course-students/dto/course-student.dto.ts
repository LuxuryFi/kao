import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseStudentDto {
  @ApiProperty({ description: 'Student ID (User ID)' })
  @IsNumber()
  student_id: number;

  @ApiProperty({ description: 'Course ID' })
  @IsNumber()
  course_id: number;

  @ApiProperty({ description: 'Status', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdateCourseStudentDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Student ID (User ID)', required: false })
  @IsNumber()
  @IsOptional()
  student_id?: number;

  @ApiProperty({ description: 'Course ID', required: false })
  @IsNumber()
  @IsOptional()
  course_id?: number;

  @ApiProperty({ description: 'Status', required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class DeleteCourseStudentDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}

