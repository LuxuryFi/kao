import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { CONFIG } from '../config/config.provider';
import { UserEntity } from '../users/entities/user.entity';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomersService extends BaseService<CustomerEntity> {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customersRepository: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(CONFIG) private readonly configService: IConfig,
  ) {
    super(customersRepository);
  }

  async validateCustomer(payload) {
    const { username } = payload;
    const customer = await this.customersRepository.find({
      where: {
        username,
      },
    });

    if (customer.length > 0) {
      return false;
    }

    return true;
  }


  async getCustomerByParentId(
    saleId: number,
  ): Promise<[CustomerEntity[], number]> {
    const query = this.customersRepository.createQueryBuilder('customer');
    query.where('customer.sale_id = :saleId', { saleId });
    const [result, totalCount] = await query.getManyAndCount();
    return [result, totalCount];
  }
  
  async getCustomerByRole(payload) {
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

    const query = this.customersRepository.createQueryBuilder('customer');

    // If keyword is provided, search across name, email, and phone
    if (keyword) {
      query.andWhere('(user.name LIKE :keyword OR user.phone LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    } else {
      // Individual filters only apply when no keyword is provided
      if (username) {
        query.andWhere('user.username LIKE :username', {
          username: `%${username}%`,
        });
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
}

