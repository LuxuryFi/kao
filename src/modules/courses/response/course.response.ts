import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

class BaseCourseResponse {
  @IsNumber()
  @ApiProperty({ description: 'Course ID' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Course name' })
  course_name: string;

  @IsString()
  @ApiProperty({ description: 'Summary' })
  summary: string;

  @IsString()
  @ApiProperty({ description: 'Schedule JSON string' })
  schedule: string;

  @IsNumber()
  @ApiProperty({ description: 'Court ID this course belongs to' })
  court_id: number;

  @ApiProperty({ description: 'Course status: true=active, false=inactive' })
  status: boolean;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  created_at?: number;

  @ApiProperty({ type: Date, description: 'Last update date' })
  updated_date?: Date;

  @ApiProperty({ description: 'Created by username', required: false })
  created_by?: string;

  @ApiProperty({ description: 'Updated by username', required: false })
  updated_by?: string;
}

export class CreateCourseResponse extends BaseCourseResponse {}
export class GetCourseResponse extends BaseCourseResponse {}
export class UpdateCourseResponse extends BaseCourseResponse {}


