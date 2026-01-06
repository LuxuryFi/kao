import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesModule } from '../attendances/attendances.module';
import { PackageEntity } from '../packages/entities/package.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity, StudentEntity, PackageEntity]),
    AttendancesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
