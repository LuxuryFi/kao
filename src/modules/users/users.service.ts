import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(usersRepository);
  }
  getHello(): string {
    return 'Hello World!';
  }

  async validateUser(payload) {
    const { email } = payload;
    const user = await this.usersRepository.find({
      where: {
        email,
      },
    });

    if (user.length > 0) {
      return false;
    }

    return true;
  }
}
