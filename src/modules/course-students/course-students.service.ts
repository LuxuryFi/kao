import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { AttendancesService } from '../attendances/attendances.service';
import { CourseStudentEntity } from './entities/course-student.entity';

@Injectable()
export class CourseStudentsService extends BaseService<CourseStudentEntity> {
  constructor(
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentsRepository: Repository<CourseStudentEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
    @Inject(forwardRef(() => AttendancesService))
    private readonly attendancesService: AttendancesService,
  ) {
    super(courseStudentsRepository);
  }

  async isDuplicate(student_id: number, course_id: number): Promise<boolean> {
    const exist = await this.courseStudentsRepository.findOne({
      where: { student_id, course_id },
    });
    return !!exist;
  }

  async findFilteredPaginated(params: {
    student_id?: number;
    course_id?: number;
    status?: string;
    skip?: number;
    select?: number;
  }): Promise<[CourseStudentEntity[], number]> {
    const { student_id, course_id, status, skip = 0, select = 20 } = params || ({} as any);
    const qb = this.courseStudentsRepository.createQueryBuilder('course_student');

    if (student_id !== undefined && student_id !== null) {
      qb.andWhere('course_student.student_id = :student_id', { student_id });
    }

    if (course_id !== undefined && course_id !== null) {
      qb.andWhere('course_student.course_id = :course_id', { course_id });
    }

    if (status !== undefined && status !== null && status !== '') {
      const normalized = ['1', 'true', 1, true, 'TRUE'].includes(status as any);
      qb.andWhere('course_student.status = :st', { st: normalized });
    }

    qb.skip(skip).take(select);
    return qb.getManyAndCount();
  }

  async findByStudentId(studentId: number): Promise<any[]> {
    // Get courses with details for a student
    const result = await this.courseStudentsRepository
      .createQueryBuilder('course_student')
      .leftJoinAndSelect('course', 'course', 'course.id = course_student.course_id')
      .where('course_student.student_id = :studentId', { studentId })
      .select([
        'course_student.id as id',
        'course_student.student_id as student_id',
        'course_student.course_id as course_id',
        'course_student.status as status',
        'course_student.created_at as created_at',
        'course_student.updated_date as updated_date',
        'course.id as course_id_detail',
        'course.course_name as course_name',
        'course.summary as summary',
        'course.schedule as schedule',
        'course.court_id as court_id',
        'course.status as course_status',
        'course.created_at as course_created_at',
      ])
      .getRawMany();

    return result;
  }

  async findByCourseId(courseId: number): Promise<any[]> {
    // Get students with user details for a course
    const result = await this.courseStudentsRepository
      .createQueryBuilder('course_student')
      .leftJoinAndSelect('public_user', 'user', 'user.id = course_student.student_id')
      .where('course_student.course_id = :courseId', { courseId })
      .select([
        'course_student.id as id',
        'course_student.student_id as student_id',
        'course_student.course_id as course_id',
        'course_student.status as status',
        'course_student.created_at as created_at',
        'course_student.updated_date as updated_date',
        'user.id as user_id',
        'user.username as username',
        'user.name as name',
        'user.email as email',
        'user.phone as phone',
        'user.address as address',
        'user.gender as gender',
        'user.url as url',
        'user.role as role',
        'user.status as user_status',
        'user.start_date as start_date',
        'user.end_date as end_date',
      ])
      .getRawMany();

    return result;
  }

  async store(data: any): Promise<CourseStudentEntity> {
    const result = await this.courseStudentsRepository.save(data);

    // Tự động tạo attendance nếu student đã có subscription
    if (result && result.student_id && result.status !== false) {
      try {
        console.log(`[CourseStudentsService] Triggering auto-create attendances for student ${result.student_id}`);
        const attendances = await this.attendancesService.autoCreateAttendances(result.student_id);
        console.log(`[CourseStudentsService] Created ${attendances.length} attendances for student ${result.student_id}`);
      } catch (error) {
        console.error('[CourseStudentsService] Error auto-creating attendances:', error);
        // Không throw error để không ảnh hưởng đến việc tạo course_student
      }
    }

    return result;
  }
}
