import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseStaffController } from './course-staff.controller';
import { CourseStaffService } from './course-staff.service';
import { CourseStaffEntity } from './entities/course-staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseStaffEntity])],
  controllers: [CourseStaffController],
  providers: [CourseStaffService],
  exports: [CourseStaffService],
})
export class CourseStaffModule {}


