import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { CourseStaffController } from './course-staff.controller';
import { CourseStaffService } from './course-staff.service';
import { CourseStaffEntity } from './entities/course-staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseStaffEntity, CourseEntity])],
  controllers: [CourseStaffController],
  providers: [CourseStaffService],
  exports: [CourseStaffService],
})
export class CourseStaffModule { }


