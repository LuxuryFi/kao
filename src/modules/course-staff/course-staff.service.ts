import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseStaffEntity } from './entities/course-staff.entity';
import { SearchCourseStaffDto } from './dto/course-staff.dto';

@Injectable()
export class CourseStaffService {
  constructor(
    @InjectRepository(CourseStaffEntity)
    private readonly courseStaffRepo: Repository<CourseStaffEntity>,
  ) {}

  async create(data: Partial<CourseStaffEntity>): Promise<CourseStaffEntity> {
    const entity = this.courseStaffRepo.create(data);
    return this.courseStaffRepo.save(entity);
  }

  async update(id: number, data: Partial<CourseStaffEntity>): Promise<CourseStaffEntity | null> {
    const existing = await this.courseStaffRepo.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    return this.courseStaffRepo.save(existing);
  }

  async delete(id: number): Promise<boolean> {
    await this.courseStaffRepo.delete(id);
    return true;
  }

  async search(q: SearchCourseStaffDto): Promise<CourseStaffEntity[]> {
    const qb = this.courseStaffRepo.createQueryBuilder('cs');
    if (q.course_id !== undefined) {
      qb.andWhere('cs.course_id = :course_id', { course_id: q.course_id });
    }
    if (q.course_ids && q.course_ids.length > 0) {
      qb.andWhere('cs.course_id IN (:...course_ids)', { course_ids: q.course_ids });
    }
    if (q.user_id !== undefined) {
      qb.andWhere('cs.user_id = :user_id', { user_id: q.user_id });
    }
    return qb.getMany();
  }
}

