import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { CourseStaffEntity } from '../course-staff/entities/course-staff.entity';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class CoursesService extends BaseService<CourseEntity> {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,
    @InjectRepository(CourseStaffEntity)
    private readonly courseStaffRepository: Repository<CourseStaffEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(coursesRepository);
  }

  async findFilteredPaginated(params: {
    keyword?: string;
    status?: string;
    court_id?: number;
    staff_id?: number;
    skip?: number;
    select?: number;
  }): Promise<[CourseEntity[], number]> {
    const {
      keyword,
      status,
      court_id,
      staff_id,
      skip = 0,
      select = 20,
    } = params || ({} as any);
    const qb = this.coursesRepository.createQueryBuilder('course');

    if (keyword) {
      qb.andWhere('(course.course_name LIKE :kw OR course.summary LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (status !== undefined && status !== null && status !== '') {
      const normalized = ['1', 'true', 1, true, 'TRUE'].includes(status as any);
      qb.andWhere('course.status = :st', { st: normalized });
    }
    if (court_id !== undefined && court_id !== null) {
      qb.andWhere('course.court_id = :court_id', { court_id });
    }

    // Filter by staff_id: courses where user is lead OR course_staff
    if (staff_id !== undefined && staff_id !== null) {
      // Get course IDs where user is staff
      const staffCourses = await this.courseStaffRepository.find({
        where: { user_id: staff_id },
        select: ['course_id'],
      });
      const staffCourseIds = staffCourses.map((sc) => sc.course_id);

      // Combine with courses where user is lead
      if (staffCourseIds.length > 0) {
        qb.andWhere(
          '(course.lead_id = :staff_id OR course.id IN (:...staffCourseIds))',
          {
            staff_id,
            staffCourseIds,
          },
        );
      } else {
        // If no course_staff records, only check lead_id
        qb.andWhere('course.lead_id = :staff_id', { staff_id });
      }
    }

    qb.skip(skip).take(select);
    return qb.getManyAndCount();
  }
}
