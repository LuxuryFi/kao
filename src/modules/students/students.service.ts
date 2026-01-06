import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { UserEntity } from '../users/entities/user.entity';
import { StudentEntity } from './entities/student.entity';
import { SearchStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService extends BaseService<StudentEntity> {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(studentsRepository);
  }

  /**
   * Determine student status based on parent role
   * If parent role is 'customer', student status is 'trial', otherwise 'active'
   */
  async determineStudentStatus(parentId: number): Promise<string> {
    const parent = await this.usersRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent with id ${parentId} not found`);
    }

    // If parent role is 'customer', student status is 'trial'
    if (parent.role === 'customer') {
      return 'trial';
    }

    // Otherwise, default to 'active'
    return 'active';
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

    if (query.status) {
      qb.andWhere('student.status = :status', { status: query.status });
    }

    if (query.trial_status) {
      qb.andWhere('student.trial_status = :trial_status', {
        trial_status: query.trial_status,
      });
    }

    return await qb.getManyAndCount();
  }
}

