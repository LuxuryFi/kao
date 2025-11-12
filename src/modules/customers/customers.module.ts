import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from '../users/entities/user.entity';
import { UserModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from './entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, UserEntity]),
    ConfigModule,
    UserModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService, UsersService],
  exports: [CustomersService],
})
export class CustomersModule {}

