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
}


