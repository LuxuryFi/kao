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

  @ApiProperty({ description: 'Optional end time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiProperty({ description: 'Lead user id', required: false })
  @IsOptional()
  @IsNumber()
  lead_id?: number;
}

export class UpdateCourseDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  course_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    description: 'JSON string { day: [2,3,4], hour: "14:00" }',
    required: false,
  })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiProperty({
    description: 'Court ID this course belongs to',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  court_id?: number;

  @ApiProperty({ description: 'Optional end time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiProperty({ description: 'Lead user id', required: false })
  @IsOptional()
  @IsNumber()
  lead_id?: number;
}

export class DeleteCourseDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;
}


