import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { PackageEntity } from './entities/package.entity';

@Injectable()
export class PackagesService extends BaseService<PackageEntity> {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packagesRepository: Repository<PackageEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(packagesRepository);
  }

  async findFilteredPaginated(params: {
    keyword?: string;
    status?: string;
    skip?: number;
    select?: number;
  }): Promise<[PackageEntity[], number]> {
    const { keyword, status, skip = 0, select = 20 } = params || ({} as any);
    const qb = this.packagesRepository.createQueryBuilder('package');

    if (keyword) {
      qb.andWhere('(package.package_name LIKE :kw OR package.summary LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (status !== undefined && status !== null && status !== '') {
      const normalized = ['1', 'true', 1, true, 'TRUE'].includes(status as any);
      qb.andWhere('package.status = :st', { st: normalized ? 1 : 0 });
    }

    qb.skip(skip).take(select);
    return qb.getManyAndCount();
  }
}
