import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendancesModule } from '../attendances/attendances.module';
import { TeachingSchedulesModule } from '../teaching-schedules/teaching-schedules.module';
import { CronJobsService } from './cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TeachingSchedulesModule,
    AttendancesModule,
  ],
  providers: [CronJobsService],
})
export class CronModule {}

