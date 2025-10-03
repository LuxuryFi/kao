import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class CoursesService extends BaseService<CourseEntity> {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(coursesRepository);
  }

  async findFilteredPaginated(params: {
    keyword?: string;
    status?: string;
    skip?: number;
    select?: number;
  }): Promise<[CourseEntity[], number]> {
    const { keyword, status, skip = 0, select = 20 } = params || ({} as any);
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

    qb.skip(skip).take(select);
    return qb.getManyAndCount();
  }
}

