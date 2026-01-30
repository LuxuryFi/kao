import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COURSE_STAFF_ROLE } from 'src/constants/course-staff-role';
import { TEACHING_SCHEDULE_STATUS } from 'src/constants/teaching-schedule-status';
import { Repository } from 'typeorm';
import { CourseStaffEntity } from '../course-staff/entities/course-staff.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import {
  CreateTeachingScheduleDto,
  GenerateTeachingScheduleDto,
  SearchTeachingScheduleDto,
  UpdateTeachingScheduleDto,
} from './dto/teaching-schedule.dto';
import { TeachingScheduleEntity } from './entities/teaching-schedule.entity';

interface ParsedSchedule {
  day: number[];
  hour: string;
  end_time?: string;
}

@Injectable()
export class TeachingSchedulesService {
  constructor(
    @InjectRepository(TeachingScheduleEntity)
    private readonly scheduleRepo: Repository<TeachingScheduleEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseStaffEntity)
    private readonly courseStaffRepo: Repository<CourseStaffEntity>,
  ) { }

  async create(
    dto: CreateTeachingScheduleDto,
  ): Promise<TeachingScheduleEntity> {
    const entity = this.scheduleRepo.create({
      ...dto,
      status: dto.status || TEACHING_SCHEDULE_STATUS.UPCOMING,
    });
    return this.scheduleRepo.save(entity);
  }

  async update(
    dto: UpdateTeachingScheduleDto,
  ): Promise<TeachingScheduleEntity | null> {
    const entity = await this.scheduleRepo.findOne({ where: { id: dto.id } });
    if (!entity) return null;
    Object.assign(entity, dto);
    return this.scheduleRepo.save(entity);
  }

  async updateStatus(
    id: number,
    status: string,
  ): Promise<TeachingScheduleEntity | null> {
    const entity = await this.scheduleRepo.findOne({ where: { id } });
    if (!entity) return null;
    entity.status = status;
    return this.scheduleRepo.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    await this.scheduleRepo.delete(id);
    return true;
  }

  async search(
    q: SearchTeachingScheduleDto,
  ): Promise<TeachingScheduleEntity[]> {
    const qb = this.scheduleRepo.createQueryBuilder('ts');
    if (q.course_id !== undefined) {
      qb.andWhere('ts.course_id = :course_id', { course_id: q.course_id });
    }
    if (q.user_id !== undefined) {
      qb.andWhere('ts.user_id = :user_id', { user_id: q.user_id });
    }
    if (q.date) {
      qb.andWhere('ts.date = :date', { date: q.date });
    }
    if (q.time) {
      qb.andWhere('ts.time = :time', { time: q.time });
    }
    if (q.status) {
      qb.andWhere('ts.status = :status', { status: q.status });
    }
    qb.orderBy('ts.date', 'ASC').addOrderBy('ts.time', 'ASC');
    return qb.getMany();
  }

  /**
   * Generate teaching schedule for next week based on course schedule and staff
   * Updates existing records if staff/lead changed, preserves status and other info
   */
  async generateNextWeek(
    dto: GenerateTeachingScheduleDto,
  ): Promise<{ generated: number }> {
    const courses = await this.courseRepo.find(
      dto.course_id
        ? { where: { id: dto.course_id, status: true } }
        : { where: { status: true } },
    );

    const weekStart = this.getNextWeekMonday();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let created = 0;

    for (const course of courses) {
      const parsed = this.parseSchedule(course.schedule);
      if (!parsed) continue;

      const staff = await this.courseStaffRepo.find({
        where: { course_id: course.id },
      });

      // include lead if set on course
      const staffList = [...staff];
      if (course['lead_id']) {
        const hasLead = staffList.some(
          (s) =>
            s.role === COURSE_STAFF_ROLE.LEAD &&
            s.user_id === (course as any).lead_id,
        );
        if (!hasLead) {
          staffList.push({
            course_id: course.id,
            user_id: (course as any).lead_id,
            role: COURSE_STAFF_ROLE.LEAD,
          } as any);
        }
      }

      if (staffList.length === 0) continue;

      // Get existing schedules for this course in the target week
      const existingSchedules = await this.scheduleRepo.find({
        where: {
          course_id: course.id,
        },
      });

      // Filter to only schedules in the target week
      const existingInWeek = existingSchedules.filter((s) => {
        const scheduleDate = new Date(s.date);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd;
      });

      // Create a map of existing schedules: key = "course_id-date-time-user_id"
      const existingMap = new Map<string, TeachingScheduleEntity>();
      for (const existing of existingInWeek) {
        const key = `${existing.course_id}-${existing.date}-${existing.time}-${existing.user_id}`;
        existingMap.set(key, existing);
      }

      // Build expected schedules
      const expectedSchedules: Array<{
        course_id: number;
        date: string;
        time: string;
        user_id: number;
      }> = [];

      for (const d of parsed.day) {
        const targetDate = new Date(weekStart);
        targetDate.setDate(weekStart.getDate() + (d - 1));
        const dateStr = this.toDateStr(targetDate);
        for (const s of staffList) {
          expectedSchedules.push({
            course_id: course.id,
            date: dateStr,
            time: parsed.hour,
            user_id: s.user_id,
          });
        }
      }

      // Process each expected schedule
      const toCreate: TeachingScheduleEntity[] = [];
      const expectedKeys = new Set<string>();

      for (const expected of expectedSchedules) {
        const key = `${expected.course_id}-${expected.date}-${expected.time}-${expected.user_id}`;
        expectedKeys.add(key);

        const existing = existingMap.get(key);
        if (existing) {
          // Schedule already exists with same course_id, date, time, user_id
          // No need to update - preserve status and all other info
          continue;
        }

        // New schedule, create it
        toCreate.push(
          this.scheduleRepo.create({
            user_id: expected.user_id,
            course_id: expected.course_id,
            date: expected.date,
            time: expected.time,
            status: TEACHING_SCHEDULE_STATUS.UPCOMING,
          }),
        );
      }

      // Delete schedules that are no longer needed (staff removed from course or schedule changed)
      const toDelete = existingInWeek.filter((existing) => {
        const key = `${existing.course_id}-${existing.date}-${existing.time}-${existing.user_id}`;
        return !expectedKeys.has(key);
      });

      if (toCreate.length > 0) {
        await this.scheduleRepo.save(toCreate);
        created += toCreate.length;
      }

      if (toDelete.length > 0) {
        await this.scheduleRepo.remove(toDelete);
      }
    }

    return { generated: created };
  }

  private parseSchedule(raw: string): ParsedSchedule | null {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.day) && parsed.hour) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private getNextWeekMonday(): Date {
    const today = new Date();
    const day = today.getDay(); // 0 Sunday ... 6 Saturday
    let delta = (8 - day) % 7;
    if (delta === 0) delta = 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + delta);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
