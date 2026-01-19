import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TEACHING_SCHEDULE_STATUS } from 'src/constants/teaching-schedule-status';

export class CreateTeachingScheduleDto {
  @ApiProperty({ description: 'User ID (lead / sub tutor / manager)' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Course ID' })
  @IsNumber()
  course_id: number;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Time (HH:mm)' })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Status',
    enum: TEACHING_SCHEDULE_STATUS,
    required: false,
    default: TEACHING_SCHEDULE_STATUS.UPCOMING,
  })
  @IsOptional()
  @IsEnum(TEACHING_SCHEDULE_STATUS as any)
  status?: string;
}

export class UpdateTeachingScheduleDto {
  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ description: 'Time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    description: 'Status',
    enum: TEACHING_SCHEDULE_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TEACHING_SCHEDULE_STATUS as any)
  status?: string;
}

export class SearchTeachingScheduleDto {
  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ description: 'Time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    description: 'Status',
    enum: TEACHING_SCHEDULE_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TEACHING_SCHEDULE_STATUS as any)
  status?: string;
}

export class GenerateTeachingScheduleDto {
  @ApiProperty({ description: 'Course ID (optional)', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;
}

