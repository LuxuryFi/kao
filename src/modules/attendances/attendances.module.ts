import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseStudentEntity } from '../course-students/entities/course-student.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { PackageEntity } from '../packages/entities/package.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { AttendanceEntity } from './entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceEntity,
      CourseEntity,
      CourseStudentEntity,
      SubscriptionEntity,
      PackageEntity,
      StudentEntity,
    ]),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
