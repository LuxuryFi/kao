import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
    const { username } = payload;
    const user = await this.usersRepository.find({
      where: {
        username,
      },
    });

    if (user.length > 0) {
      return false;
    }

    return true;
  }

  async getUserByRole(payload) {
    // Query the users with pagination and filtering by role
    const {
      skip = 0,
      select = 20,
      username,
      email,
      name,
      phone,
      keyword,
      status,
      role,
    } = payload;

    const query = this.usersRepository.createQueryBuilder('user');

    // If keyword is provided, search across name, email, and phone
    if (keyword) {
      query.andWhere(
        '(user.name LIKE :keyword OR user.email LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    } else {
      // Individual filters only apply when no keyword is provided
      if (username) {
        query.andWhere('user.username LIKE :username', {
          username: `%${username}%`,
        });
      }
      if (email) {
        query.andWhere('user.email LIKE :email', { email: `%${email}%` });
      }
      if (name) {
        query.andWhere('user.name LIKE :name', { name: `%${name}%` });
      }
      if (phone) {
        query.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
      }
    }

    if (status !== undefined) {
      query.andWhere('user.status = :status', { status });
    }
    if (Array.isArray(role) && role.length > 0) {
      query.andWhere('user.role IN (:...roles)', { roles: role });
    } else if (typeof role === 'string' && role) {
      query.andWhere('user.role LIKE :role', { role: `%${role}%` });
    }

    query.skip(skip).take(select);

    const [result, totalCount] = await query.getManyAndCount();

    return [result, totalCount];
  }

  async getUserByParentId(parentId: number): Promise<[UserEntity[], number]> {
    const query = this.usersRepository.createQueryBuilder('user');
    query.where('user.parent_id = :parentId', { parentId });
    const [result, totalCount] = await query.getManyAndCount();
    return [result, totalCount];
  }

  async updatePassword(userId: number, newPassword: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;

    return await this.usersRepository.save(user);
  }
}
