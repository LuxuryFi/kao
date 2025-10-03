import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { CourtEntity } from './entities/court.entity';

@Injectable()
export class CourtsService extends BaseService<CourtEntity> {
  constructor(
    @InjectRepository(CourtEntity)
    private readonly courtsRepository: Repository<CourtEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(courtsRepository);
  }

  async findFilteredPaginated(params: {
    city?: string;
    district?: string;
    skip?: number;
    select?: number;
  }): Promise<[CourtEntity[], number]> {
    const { city, district, skip = 0, select = 20 } = params || ({} as any);
    const qb = this.courtsRepository.createQueryBuilder('court');
    if (city) qb.andWhere('court.city = :city', { city });
    if (district) qb.andWhere('court.district = :district', { district });
    qb.skip(skip).take(select);
    return qb.getManyAndCount();
  }
}


