import { ApiProperty } from '@nestjs/swagger';

export class CourseStudentResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  student_id: number;

  @ApiProperty()
  course_id: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  updated_date?: Date;

  @ApiProperty()
  created_at?: number;
}

export class StudentWithUserDetailsResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  student_id: number;

  @ApiProperty()
  course_id: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  created_at?: number;

  @ApiProperty()
  updated_date?: Date;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  address?: string;

  @ApiProperty()
  gender?: boolean;

  @ApiProperty()
  url?: string;

  @ApiProperty()
  role?: string;

  @ApiProperty()
  user_status?: boolean;

  @ApiProperty()
  start_date?: number;

  @ApiProperty()
  end_date?: number;
}

export class CourseWithDetailsResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  student_id: number;

  @ApiProperty()
  course_id: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  created_at?: number;

  @ApiProperty()
  updated_date?: Date;

  @ApiProperty()
  course_id_detail: number;

  @ApiProperty()
  course_name: string;

  @ApiProperty()
  summary?: string;

  @ApiProperty()
  schedule: string;

  @ApiProperty()
  court_id: number;

  @ApiProperty()
  course_status: boolean;

  @ApiProperty()
  course_created_at?: number;
}

export class CreateCourseStudentResponse {
  @ApiProperty()
  data: CourseStudentResponse;

  @ApiProperty()
  message: string;
}

export class GetCourseStudentResponse {
  @ApiProperty()
  data: CourseStudentResponse;

  @ApiProperty()
  message: string;
}

export class UpdateCourseStudentResponse {
  @ApiProperty()
  data: CourseStudentResponse;

  @ApiProperty()
  message: string;
}
