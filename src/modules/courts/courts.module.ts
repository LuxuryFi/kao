import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { CourtEntity } from './entities/court.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourtEntity]), ConfigModule],
  controllers: [CourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule {}


