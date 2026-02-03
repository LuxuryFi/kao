import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseStaffEntity } from '../course-staff/entities/course-staff.entity';
import { ConfigModule } from '../config/config.module';
import { CourseStaffModule } from '../course-staff/course-staff.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, CourseStaffEntity]),
    ConfigModule,
    CourseStaffModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}


