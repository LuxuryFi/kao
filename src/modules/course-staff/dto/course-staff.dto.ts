import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { COURSE_STAFF_ROLE } from 'src/constants/course-staff-role';

export class CreateCourseStaffDto {
  @ApiProperty({ description: 'Course ID' })
  @IsNumber()
  course_id: number;

  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description:
      'Role of staff in course. One of: ' +
      Object.values(COURSE_STAFF_ROLE).join(', '),
    enum: COURSE_STAFF_ROLE,
  })
  @IsEnum(COURSE_STAFF_ROLE as any)
  role: string;
}

export class UpdateCourseStaffDto {
  @ApiProperty({ description: 'Record ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Role', enum: COURSE_STAFF_ROLE, required: false })
  @IsOptional()
  @IsEnum(COURSE_STAFF_ROLE as any)
  role?: string;
}

export class SearchCourseStaffDto {
  @ApiProperty({ description: 'Course ID', required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: 'Course IDs', required: false, isArray: true, type: Number })
  @IsOptional()
  course_ids?: number[];

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;
}

