import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendancesService } from '../attendances/attendances.service';
import { TeachingSchedulesService } from '../teaching-schedules/teaching-schedules.service';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    private readonly teachingSchedulesService: TeachingSchedulesService,
    private readonly attendancesService: AttendancesService,
  ) {}

  /**
   * Weekly job: generate next-week teaching schedules.
   * Runs every Wednesday at 00:05.
   *
   * Note: generateNextWeek() is idempotent and will update based on current course/staff.
   */
  @Cron('5 0 * * 3')
  async generateTeachingSchedulesWeekly() {
    try {
      this.logger.log('Cron: generateTeachingSchedulesWeekly started');
      const result = await this.teachingSchedulesService.generateNextWeek({});
      this.logger.log(
        `Cron: generateTeachingSchedulesWeekly completed: generated=${result.generated}`,
      );
    } catch (e: any) {
      this.logger.error(
        `Cron: generateTeachingSchedulesWeekly failed: ${e?.message || e}`,
      );
    }
  }

  /**
   * Daily job: end-of-day reconciliation.
   * If attendance is still NOT_CHECKED_IN, mark as ABSENT_NO_REASON.
   * If teaching schedule is still UPCOMING/NOT_CHECKED_IN and no check-in happened, mark as ABSENT.
   *
   * Runs every day at 23:59.
   */
  @Cron('59 23 * * *')
  async markDailyAbsents() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    try {
      this.logger.log(`Cron: markDailyAbsents started for date=${dateStr}`);
      const [att, ts] = await Promise.all([
        this.attendancesService.markAbsentsForDate(dateStr),
        this.teachingSchedulesService.markAbsentsForDate(dateStr),
      ]);
      this.logger.log(
        `Cron: markDailyAbsents completed for date=${dateStr}: attendanceUpdated=${att.updated}, teachingScheduleUpdated=${ts.updated}`,
      );
    } catch (e: any) {
      this.logger.error(
        `Cron: markDailyAbsents failed for date=${dateStr}: ${e?.message || e}`,
      );
    }
  }
}
