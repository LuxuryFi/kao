import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { SearchCourseStaffDto } from './dto/course-staff.dto';
import { CourseStaffEntity } from './entities/course-staff.entity';

interface ParsedSchedule {
  day: number[];
  hour: string;
  end_time?: string;
}

@Injectable()
export class CourseStaffService {
  constructor(
    @InjectRepository(CourseStaffEntity)
    private readonly courseStaffRepo: Repository<CourseStaffEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
  ) { }

  async create(data: Partial<CourseStaffEntity>): Promise<CourseStaffEntity> {
    // Check for schedule conflicts before creating
    if (data.course_id && data.user_id) {
      await this.checkScheduleConflict(data.user_id, data.course_id);
    }

    const entity = this.courseStaffRepo.create(data);
    return this.courseStaffRepo.save(entity);
  }

  async update(id: number, data: Partial<CourseStaffEntity>): Promise<CourseStaffEntity | null> {
    const existing = await this.courseStaffRepo.findOne({ where: { id } });
    if (!existing) return null;

    // Check for schedule conflicts if course_id or user_id is being changed
    const newCourseId = data.course_id !== undefined ? data.course_id : existing.course_id;
    const newUserId = data.user_id !== undefined ? data.user_id : existing.user_id;

    if (newCourseId !== existing.course_id || newUserId !== existing.user_id) {
      await this.checkScheduleConflict(newUserId, newCourseId, existing.id);
    }

    Object.assign(existing, data);
    return this.courseStaffRepo.save(existing);
  }

  async delete(id: number): Promise<boolean> {
    await this.courseStaffRepo.delete(id);
    return true;
  }

  async search(q: SearchCourseStaffDto): Promise<CourseStaffEntity[]> {
    const qb = this.courseStaffRepo.createQueryBuilder('cs');
    if (q.course_id !== undefined) {
      qb.andWhere('cs.course_id = :course_id', { course_id: q.course_id });
    }
    if (q.course_ids && q.course_ids.length > 0) {
      qb.andWhere('cs.course_id IN (:...course_ids)', { course_ids: q.course_ids });
    }
    if (q.user_id !== undefined) {
      qb.andWhere('cs.user_id = :user_id', { user_id: q.user_id });
    }
    return qb.getMany();
  }

  /**
   * Check if adding user to course would create schedule conflicts
   * Public method that can be called from other services (e.g., when setting lead_id)
   * @param userId User ID to check
   * @param newCourseId New course ID to add user to
   * @param excludeCourseStaffId Optional: exclude this course staff record (for update)
   */
  async checkScheduleConflict(
    userId: number,
    newCourseId: number,
    excludeCourseStaffId?: number,
  ): Promise<void> {
    // Get the new course
    const newCourse = await this.courseRepo.findOne({ where: { id: newCourseId } });
    if (!newCourse || !newCourse.status) {
      return; // Course not found or inactive, skip check
    }

    const newSchedule = this.parseSchedule(newCourse.schedule);
    if (!newSchedule) {
      return; // Invalid schedule, skip check
    }

    // Get all courses this user is already assigned to (via course_staff table)
    const existingCourseStaff = await this.courseStaffRepo.find({
      where: { user_id: userId },
    });

    // Filter out the current record if updating
    const relevantCourseStaff = excludeCourseStaffId
      ? existingCourseStaff.filter((cs) => cs.id !== excludeCourseStaffId)
      : existingCourseStaff;

    const existingCourseIds = relevantCourseStaff.map((cs) => cs.course_id);

    // Also check if user is lead of any courses
    const leadCourses = await this.courseRepo.find({
      where: { lead_id: userId, status: true },
    });

    const allExistingCourseIds = [
      ...new Set([...existingCourseIds, ...leadCourses.map((c) => c.id)]),
    ].filter((id) => id !== newCourseId); // Exclude the new course itself

    if (allExistingCourseIds.length === 0) {
      return; // No existing courses, no conflict
    }

    // Get all existing courses
    const existingCourses = await this.courseRepo.find({
      where: allExistingCourseIds.map((id) => ({ id, status: true })),
    });

    // Check for conflicts
    for (const existingCourse of existingCourses) {
      const existingSchedule = this.parseSchedule(existingCourse.schedule);
      if (!existingSchedule) continue;

      // Check if days overlap
      const dayOverlap = newSchedule.day.some((day) => existingSchedule.day.includes(day));
      if (!dayOverlap) continue;

      // Check if time overlaps
      const timeConflict = this.checkTimeConflict(
        newSchedule.hour,
        newSchedule.end_time,
        existingSchedule.hour,
        existingSchedule.end_time,
      );

      if (timeConflict) {
        throw new BadRequestException(
          `Schedule conflict: User is already assigned to course "${existingCourse.course_name}" ` +
          `at the same time (${this.formatSchedule(existingSchedule)}). ` +
          `New course schedule: ${this.formatSchedule(newSchedule)}`,
        );
      }
    }
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

  private checkTimeConflict(
    time1: string,
    endTime1: string | undefined,
    time2: string,
    endTime2: string | undefined,
  ): boolean {
    // Convert time strings (HH:mm) to minutes for comparison
    const toMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = toMinutes(time1);
    const start2 = toMinutes(time2);
    const end1 = endTime1 ? toMinutes(endTime1) : start1 + 60; // Default 1 hour if no end time
    const end2 = endTime2 ? toMinutes(endTime2) : start2 + 60;

    // Check if time ranges overlap
    return start1 < end2 && start2 < end1;
  }

  private formatSchedule(schedule: ParsedSchedule): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = schedule.day.map((d) => dayNames[d] || `Day ${d}`).join(', ');
    const timeRange = schedule.end_time
      ? `${schedule.hour} - ${schedule.end_time}`
      : schedule.hour;
    return `${days} at ${timeRange}`;
  }
}

