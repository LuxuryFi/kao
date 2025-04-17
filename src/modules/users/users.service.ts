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

  async getUserByRole(payload) {
    // Query the users with pagination and filtering by role
    const { skip = 0, select = 20, email, phone, name, status, role } = payload;

    const query = this.usersRepository.createQueryBuilder('user');

    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }
    if (phone) {
      query.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }
    if (name) {
      query.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }
    if (status !== undefined) {
      query.andWhere('user.status = :status', { status });
    }
    if (role) {
      query.andWhere('user.role LIKE :role', { role: `%${role}%` });
    }

    query.skip(skip).take(select);

    const [result, totalCount] = await query.getManyAndCount();

    return [result, totalCount];
  }
}
