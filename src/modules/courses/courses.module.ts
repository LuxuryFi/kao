import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), ConfigModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}


