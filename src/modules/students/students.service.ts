import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { StudentEntity } from './entities/student.entity';
import { SearchStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService extends BaseService<StudentEntity> {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(studentsRepository);
  }

  async getStudentsByParentId(parentId: number): Promise<[StudentEntity[], number]> {
    const query = this.studentsRepository.createQueryBuilder('student');
    query.where('student.parent_id = :parentId', { parentId });
    const [result, totalCount] = await query.getManyAndCount();
    return [result, totalCount];
  }

  async search(query: SearchStudentDto): Promise<[StudentEntity[], number]> {
    const qb = this.studentsRepository.createQueryBuilder('student');

    if (query.parent_id) {
      qb.andWhere('student.parent_id = :parent_id', { parent_id: query.parent_id });
    }

    if (query.name) {
      qb.andWhere('student.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.phone) {
      qb.andWhere('student.phone LIKE :phone', { phone: `%${query.phone}%` });
    }

    return await qb.getManyAndCount();
  }
}

