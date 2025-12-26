import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ATTENDANCE_STATUS } from 'src/constants/attendance';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Student ID (User ID)' })
  @IsInt()
  student_id: number;

  @ApiProperty({ description: 'Course ID' })
  @IsInt()
  course_id: number;

  @ApiProperty({ description: 'Date of attendance (YYYY-MM-DD format)' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Time of attendance (HH:mm format)' })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Attendance status',
    enum: Object.values(ATTENDANCE_STATUS),
    required: false,
    default: ATTENDANCE_STATUS.NOT_CHECKED_IN,
  })
  @IsOptional()
  @IsEnum(ATTENDANCE_STATUS)
  status?: string;
}

export class UpdateAttendanceDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Attendance status',
    enum: Object.values(ATTENDANCE_STATUS),
    required: false,
  })
  @IsOptional()
  @IsEnum(ATTENDANCE_STATUS)
  status?: string;
}

export class SearchAttendanceDto {
  @ApiProperty({ required: false, type: Number })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  student_id?: number;

  @ApiProperty({ required: false, type: Number })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  course_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
