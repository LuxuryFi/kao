import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseStaffEntity } from '../course-staff/entities/course-staff.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { TeachingScheduleEntity } from './entities/teaching-schedule.entity';
import { TeachingSchedulesController } from './teaching-schedules.controller';
import { TeachingSchedulesService } from './teaching-schedules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeachingScheduleEntity, CourseEntity, CourseStaffEntity]),
  ],
  controllers: [TeachingSchedulesController],
  providers: [TeachingSchedulesService],
  exports: [TeachingSchedulesService],
})
export class TeachingSchedulesModule { }





