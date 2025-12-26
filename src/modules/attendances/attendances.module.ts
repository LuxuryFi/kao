import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { CourseStudentEntity } from '../course-students/entities/course-student.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { PackageEntity } from '../packages/entities/package.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceEntity,
      CourseEntity,
      CourseStudentEntity,
      SubscriptionEntity,
      PackageEntity,
      UserEntity,
    ]),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
