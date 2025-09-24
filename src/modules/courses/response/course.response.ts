import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

class BaseCourseResponse {
  @IsNumber()
  @ApiProperty({ description: 'Course ID' })
  id: number;

  @IsString()
  @ApiProperty({ description: 'Course name' })
  course_name: string;

  @IsNumber()
  @ApiProperty({ description: 'Quantity (e.g., lessons)' })
  quantity: number;

  @IsString()
  @ApiProperty({ description: 'Summary' })
  summary: string;

  @IsString()
  @ApiProperty({ description: 'Schedule JSON string' })
  schedule: string;

  @IsNumber()
  @ApiProperty({ description: 'Expiration in months' })
  expired: number;

  @IsNumber()
  @ApiProperty({ description: 'Price' })
  price: number;
}

export class CreateCourseResponse extends BaseCourseResponse {}
export class GetCourseResponse extends BaseCourseResponse {}
export class UpdateCourseResponse extends BaseCourseResponse {}


