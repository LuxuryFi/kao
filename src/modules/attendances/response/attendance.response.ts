import { ApiProperty } from '@nestjs/swagger';

export class AttendanceResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  student_id: number;

  @ApiProperty()
  course_id: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  time: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  updated_date?: Date;

  @ApiProperty()
  is_trial: boolean;
}
