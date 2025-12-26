import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { AttendancesModule } from '../attendances/attendances.module';
import { CourseStudentsController } from './course-students.controller';
import { CourseStudentsService } from './course-students.service';
import { CourseStudentEntity } from './entities/course-student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseStudentEntity]),
    ConfigModule,
    AttendancesModule,
  ],
  controllers: [CourseStudentsController],
  providers: [CourseStudentsService],
  exports: [CourseStudentsService],
})
export class CourseStudentsModule {}
