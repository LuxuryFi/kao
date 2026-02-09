import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ATTENDANCE_STATUS } from 'src/constants/attendance';
import { CONTACT_STATUS } from 'src/constants/contact-status';
import { TRIAL_STATUS } from 'src/constants/trial-status';
import { Repository } from 'typeorm';
import { CourseStudentEntity } from '../course-students/entities/course-student.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { PackageEntity } from '../packages/entities/package.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { UserEntity } from '../users/entities/user.entity';
import {
  CreateAttendanceDto,
  SearchAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';
import { AttendanceEntity } from './entities/attendance.entity';

interface ScheduleItem {
  day: number;
  hour: string;
  course_id: number;
}

interface Schedule {
  day: number[];
  hour: string;
}

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseStudentEntity)
    private readonly courseStudentRepo: Repository<CourseStudentEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PackageEntity)
    private readonly packageRepo: Repository<PackageEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) { }

  /**
   * Tạo attendance tự động khi student có cả course active và subscription
   */
  async autoCreateAttendances(studentId: number): Promise<AttendanceEntity[]> {
    console.log(
      `[AttendancesService] autoCreateAttendances called for student ${studentId}`,
    );

    // 1. Lấy danh sách course active của student
    const activeCourses = await this.courseStudentRepo.find({
      where: { student_id: studentId, status: true },
    });

    console.log(
      `[AttendancesService] Found ${activeCourses.length} active courses for student ${studentId}`,
    );

    if (activeCourses.length === 0) {
      console.log(
        `[AttendancesService] No active courses found, skipping attendance creation`,
      );
      return [];
    }

    // 2. Lấy subscription active của student
    const subscription = await this.subscriptionRepo.findOne({
      where: { student_id: studentId, status: 1, deleted: 0 },
    });

    console.log(
      `[AttendancesService] Subscription found:`,
      subscription
        ? `id=${subscription.subscription_id}, start_date=${subscription.start_date}`
        : 'none',
    );

    if (!subscription || !subscription.start_date) {
      console.log(
        `[AttendancesService] No subscription or start_date found, skipping attendance creation`,
      );
      return [];
    }

    // 3. Lấy package để biết số lượng buổi học
    const pkg = await this.packageRepo.findOne({
      where: { package_id: subscription.package_id },
    });

    if (!pkg) {
      return [];
    }

    // 4. Lấy thông tin chi tiết các course
    const courseIds = activeCourses.map((cs) => cs.course_id);
    const courses = await this.courseRepo.find({
      where: courseIds.map((id) => ({ id, status: true })),
    });

    if (courses.length === 0) {
      return [];
    }

    // 5. Parse schedule và tạo danh sách schedule items
    const scheduleItems: ScheduleItem[] = [];
    for (const course of courses) {
      try {
        const schedule: Schedule = JSON.parse(course.schedule);
        if (schedule.day && Array.isArray(schedule.day) && schedule.hour) {
          console.log(
            `[AttendancesService] Course ${course.id} schedule: day=${JSON.stringify(schedule.day)}, hour=${schedule.hour}`,
          );
          for (const day of schedule.day) {
            scheduleItems.push({
              day,
              hour: schedule.hour,
              course_id: course.id,
            });
          }
        }
      } catch (error) {
        console.error(`Error parsing schedule for course ${course.id}:`, error);
      }
    }
    console.log(
      `[AttendancesService] Total schedule items: ${scheduleItems.length}`,
    );

    // 6. Sắp xếp schedule items theo day và hour
    scheduleItems.sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      return a.hour.localeCompare(b.hour);
    });

    // 7. Tính toán ngày học dựa trên start_date
    const startDate = new Date(subscription.start_date * 1000); // Convert UNIX timestamp to Date

    // 8. Tạo attendance records
    const attendances: AttendanceEntity[] = [];
    let sessionCount = 0;
    const totalSessions = pkg.quantity;
    let weekOffset = 0;

    // Pre-fetch all existing attendances for this student to avoid duplicate queries
    const existingAttendances = await this.attendanceRepo.find({
      where: { student_id: studentId },
    });
    const existingMap = new Map<string, AttendanceEntity>();
    for (const existing of existingAttendances) {
      const key = `${existing.student_id}-${existing.course_id}-${existing.date}-${existing.time}`;
      existingMap.set(key, existing);
    }

    // Tính Chủ nhật của tuần chứa startDate một lần (trước vòng lặp)
    const startDateDayOfWeek = startDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const daysFromSunday = startDateDayOfWeek === 0 ? 0 : startDateDayOfWeek;
    const firstWeekSunday = new Date(startDate);
    firstWeekSunday.setDate(startDate.getDate() - daysFromSunday);
    firstWeekSunday.setHours(0, 0, 0, 0);

    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);

    while (sessionCount < totalSessions) {
      // Tính Chủ nhật của tuần hiện tại (weekOffset) - tính một lần cho mỗi tuần
      const currentWeekSunday = new Date(firstWeekSunday);
      currentWeekSunday.setDate(firstWeekSunday.getDate() + weekOffset * 7);
      currentWeekSunday.setHours(0, 0, 0, 0);

      for (const item of scheduleItems) {
        if (sessionCount >= totalSessions) {
          break;
        }

        // Tính toán ngày học
        // day format: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
        // Tính ngày học từ Chủ nhật của tuần hiện tại: day 1 (Sunday) = +0, day 2 (Monday) = +1, ...
        const targetDate = new Date(currentWeekSunday);
        targetDate.setDate(currentWeekSunday.getDate() + (item.day - 1));
        targetDate.setHours(0, 0, 0, 0);

        // Chỉ tạo nếu ngày học >= startDate (không tạo các ngày trong quá khứ)
        if (targetDate < startDateOnly) {
          console.log(
            `[AttendancesService] Skipping: targetDate ${targetDate.toISOString().split('T')[0]} < startDate ${startDateOnly.toISOString().split('T')[0]}`,
          );
          continue;
        }

        // Format date as YYYY-MM-DD in local time (tránh lệch ngày do toISOString/UTC)
        const year = targetDate.getFullYear();
        const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = targetDate.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        console.log(
          `[AttendancesService] Processing: course_id=${item.course_id}, schedule_day=${item.day}, targetDate=${dateStr}, weekOffset=${weekOffset}`,
        );

        // Kiểm tra xem attendance đã tồn tại chưa (check trong map để tránh duplicate)
        const key = `${studentId}-${item.course_id}-${dateStr}-${item.hour}`;
        const existingAttendance = existingMap.get(key);

        if (!existingAttendance) {
          const attendance = this.attendanceRepo.create({
            student_id: studentId,
            course_id: item.course_id,
            date: dateStr,
            time: item.hour,
            status: ATTENDANCE_STATUS.NOT_CHECKED_IN,
            is_trial: false, // Auto-created attendances are not trial
          });
          attendances.push(attendance);
          // Add to map to prevent duplicates in the same batch
          existingMap.set(key, attendance);
          sessionCount++;
        } else {
          // Nếu đã tồn tại, vẫn tính vào số lượng buổi học
          sessionCount++;
        }
      }
      weekOffset++;
    }

    // 9. Lưu tất cả attendance vào database
    console.log(
      `[AttendancesService] Prepared ${attendances.length} attendance records to save`,
    );
    if (attendances.length > 0) {
      const saved = await this.attendanceRepo.save(attendances);
      console.log(
        `[AttendancesService] Successfully saved ${saved.length} attendance records`,
      );
      return saved;
    }

    console.log(`[AttendancesService] No attendance records to save`);
    return [];
  }

  async markAbsentsForDate(dateStr: string): Promise<{ updated: number }> {
    const res = await this.attendanceRepo
      .createQueryBuilder()
      .update(AttendanceEntity)
      .set({ status: ATTENDANCE_STATUS.ABSENT_NO_REASON })
      .where('date = :date', { date: dateStr })
      .andWhere('status = :status', {
        status: ATTENDANCE_STATUS.NOT_CHECKED_IN,
      })
      .execute();

    return { updated: res.affected || 0 };
  }

  async create(data: CreateAttendanceDto): Promise<AttendanceEntity> {
    const entity = this.attendanceRepo.create({
      ...data,
      status: data.status || ATTENDANCE_STATUS.NOT_CHECKED_IN,
      is_trial: data.is_trial !== undefined ? data.is_trial : false,
    });
    const saved = await this.attendanceRepo.save(entity);

    // Nếu là buổi học thử, cập nhật trial_status của student và contact_status của parent
    if (saved.is_trial && saved.student_id) {
      await this.studentRepo.update(
        { id: saved.student_id },
        { trial_status: TRIAL_STATUS.TRIAL_REGISTERED },
      );
      await this.updateParentContactStatus(saved.student_id);
    }

    return saved;
  }

  async update(data: UpdateAttendanceDto): Promise<AttendanceEntity | null> {
    const entity = await this.attendanceRepo.findOne({
      where: { id: data.id },
    });
    if (!entity) return null;

    const oldStatus = entity.status;
    Object.assign(entity, data);
    const saved = await this.attendanceRepo.save(entity);

    // Nếu là buổi học thử và status chuyển sang CHECKED_IN,
    // cập nhật trial_status của student và contact_status của parent
    if (
      saved.is_trial &&
      saved.student_id &&
      oldStatus !== ATTENDANCE_STATUS.CHECKED_IN &&
      saved.status === ATTENDANCE_STATUS.CHECKED_IN
    ) {
      await this.studentRepo.update(
        { id: saved.student_id },
        { trial_status: TRIAL_STATUS.TRIAL_ATTENDED },
      );
      await this.updateParentContactStatus(saved.student_id);
    }

    return saved;
  }

  /**
   * Cập nhật contact_status cho parent (role customer) dựa trên trial_status của tất cả student con
   */
  private async updateParentContactStatus(studentId: number): Promise<void> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });

    if (!student || !student.parent_id) {
      return;
    }

    // Chỉ áp dụng cho parent có role = customer
    const parent = await this.userRepo.findOne({
      where: { id: student.parent_id },
    });

    if (!parent || parent.role !== 'customer') {
      return;
    }

    const children = await this.studentRepo.find({
      where: { parent_id: parent.id },
    });

    if (!children || children.length === 0) {
      await this.userRepo.update(
        { id: parent.id },
        { contact_status: CONTACT_STATUS.NOT_CONTACTED },
      );
      return;
    }

    const total = children.length;
    const trialRegisteredCount = children.filter(
      (s) =>
        s.trial_status === TRIAL_STATUS.TRIAL_REGISTERED ||
        s.trial_status === TRIAL_STATUS.TRIAL_ATTENDED,
    ).length;
    const trialAttendedCount = children.filter(
      (s) => s.trial_status === TRIAL_STATUS.TRIAL_ATTENDED,
    ).length;

    let newStatus: string;

    if (trialAttendedCount > 0) {
      newStatus =
        trialAttendedCount === total
          ? CONTACT_STATUS.TRIAL_ATTENDED_ALL
          : CONTACT_STATUS.TRIAL_ATTENDED_PARTIAL;
    } else if (trialRegisteredCount > 0) {
      newStatus =
        trialRegisteredCount === total
          ? CONTACT_STATUS.TRIAL_REGISTERED_ALL
          : CONTACT_STATUS.TRIAL_REGISTERED_PARTIAL;
    } else {
      newStatus = CONTACT_STATUS.NOT_CONTACTED;
    }

    await this.userRepo.update(
      { id: parent.id },
      { contact_status: newStatus },
    );
  }

  async findOne(id: number): Promise<AttendanceEntity | null> {
    return await this.attendanceRepo.findOne({ where: { id } });
  }

  async search(query: SearchAttendanceDto): Promise<AttendanceEntity[]> {
    const qb = this.attendanceRepo.createQueryBuilder('attendance');

    if (query.student_id) {
      qb.andWhere('attendance.student_id = :student_id', {
        student_id: query.student_id,
      });
    }

    if (query.course_id) {
      qb.andWhere('attendance.course_id = :course_id', {
        course_id: query.course_id,
      });
    }

    if (query.date) {
      qb.andWhere('attendance.date = :date', { date: query.date });
    }

    if (query.status) {
      qb.andWhere('attendance.status = :status', { status: query.status });
    }

    if (query.is_trial !== undefined) {
      qb.andWhere('attendance.is_trial = :is_trial', {
        is_trial: query.is_trial,
      });
    }

    qb.orderBy('attendance.date', 'ASC').addOrderBy('attendance.time', 'ASC');

    return await qb.getMany();
  }

  async findByStudentId(studentId: number): Promise<AttendanceEntity[]> {
    return await this.attendanceRepo.find({
      where: { student_id: studentId },
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findByCourseId(courseId: number): Promise<AttendanceEntity[]> {
    return await this.attendanceRepo.find({
      where: { course_id: courseId },
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async delete(id: number): Promise<void> {
    await this.attendanceRepo.delete(id);
  }

  /**
   * Tạo attendance cho toàn bộ users có đủ điều kiện
   * @param role Optional - filter theo role (ví dụ: 'student')
   * @returns Kết quả tổng hợp
   */
  async createAttendancesForAllUsers(role?: string): Promise<{
    totalUsers: number;
    processedUsers: number;
    createdAttendances: number;
    skippedUsers: number;
    details: Array<{
      userId: number;
      userName: string;
      hasActiveCourses: boolean;
      hasSubscription: boolean;
      hasStartDate: boolean;
      attendancesCreated: number;
      status: 'created' | 'skipped' | 'error';
      error?: string;
    }>;
  }> {
    console.log(
      `[AttendancesService] Starting createAttendancesForAllUsers, role filter: ${role || 'all'}`,
    );

    // 1. Lấy tất cả students
    const query = this.studentRepo.createQueryBuilder('student');
    const students = await query.getMany();

    console.log(
      `[AttendancesService] Found ${students.length} students to process`,
    );

    const result = {
      totalUsers: students.length,
      processedUsers: 0,
      createdAttendances: 0,
      skippedUsers: 0,
      details: [] as Array<{
        userId: number;
        userName: string;
        hasActiveCourses: boolean;
        hasSubscription: boolean;
        hasStartDate: boolean;
        attendancesCreated: number;
        status: 'created' | 'skipped' | 'error';
        error?: string;
      }>,
    };

    // 2. Xử lý từng student
    for (const student of students) {
      const detail: (typeof result.details)[0] = {
        userId: student.id,
        userName: student.name,
        hasActiveCourses: false,
        hasSubscription: false,
        hasStartDate: false,
        attendancesCreated: 0,
        status: 'skipped',
      };

      try {
        // Kiểm tra xem student đã có attendance chưa
        const existingAttendances = await this.attendanceRepo.find({
          where: { student_id: student.id },
          take: 1,
        });

        if (existingAttendances.length > 0) {
          console.log(
            `[AttendancesService] Student ${student.id} already has ${existingAttendances.length} attendances, skipping`,
          );
          detail.status = 'skipped';
          detail.error = 'Already has attendances';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Kiểm tra course active
        const activeCourses = await this.courseStudentRepo.find({
          where: { student_id: student.id, status: true },
        });
        detail.hasActiveCourses = activeCourses.length > 0;

        if (!detail.hasActiveCourses) {
          console.log(
            `[AttendancesService] Student ${student.id} has no active courses, skipping`,
          );
          detail.status = 'skipped';
          detail.error = 'No active courses';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Kiểm tra subscription
        const subscription = await this.subscriptionRepo.findOne({
          where: { student_id: student.id, status: 1, deleted: 0 },
        });
        detail.hasSubscription = !!subscription;
        detail.hasStartDate = !!(subscription && subscription.start_date);

        if (!subscription || !subscription.start_date) {
          console.log(
            `[AttendancesService] Student ${student.id} has no subscription or start_date, skipping`,
          );
          detail.status = 'skipped';
          detail.error = !subscription ? 'No subscription' : 'No start_date';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Tạo attendance
        const attendances = await this.autoCreateAttendances(student.id);
        detail.attendancesCreated = attendances.length;
        detail.status = 'created';
        result.createdAttendances += attendances.length;
        result.processedUsers++;

        console.log(
          `[AttendancesService] Created ${attendances.length} attendances for student ${student.id}`,
        );
      } catch (error) {
        console.error(
          `[AttendancesService] Error processing student ${student.id}:`,
          error,
        );
        detail.status = 'error';
        detail.error = error.message || 'Unknown error';
        result.skippedUsers++;
      }

      result.details.push(detail);
    }

    console.log(
      `[AttendancesService] Completed: ${result.processedUsers} processed, ${result.createdAttendances} attendances created, ${result.skippedUsers} skipped`,
    );

    return result;
  }

  /**
   * Lấy trạng thái của học sinh: đã có subscription và đã tham gia lớp nào
   */
  async getStudentStatus(studentId: number): Promise<{
    student_id: number;
    student_name: string;
    has_subscription: boolean;
    subscription?: {
      subscription_id: number;
      package_id: number;
      package_name: string;
      quantity: number;
      start_date?: number;
      status: number;
    };
    has_courses: boolean;
    courses: Array<{
      course_id: number;
      course_name: string;
      status: boolean;
      schedule: string;
      court_id: number;
    }>;
    can_create_attendance: boolean;
    reason?: string;
  }> {
    // Lấy thông tin student
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error(`Student with id ${studentId} not found`);
    }

    // Lấy subscription
    const subscription = await this.subscriptionRepo.findOne({
      where: { student_id: studentId, status: 1, deleted: 0 },
    });

    let subscriptionInfo = null;
    if (subscription) {
      const pkg = await this.packageRepo.findOne({
        where: { package_id: subscription.package_id },
      });
      subscriptionInfo = {
        subscription_id: subscription.subscription_id,
        package_id: subscription.package_id,
        package_name: pkg?.package_name || '',
        quantity: subscription.quantity,
        start_date: subscription.start_date,
        status: subscription.status,
      };
    }

    // Lấy danh sách courses
    const courseStudents = await this.courseStudentRepo.find({
      where: { student_id: studentId, status: true },
    });

    const courses = [];
    if (courseStudents.length > 0) {
      const courseIds = courseStudents.map((cs) => cs.course_id);
      const courseDetails = await this.courseRepo.find({
        where: courseIds.map((id) => ({ id, status: true })),
      });

      for (const course of courseDetails) {
        courses.push({
          course_id: course.id,
          course_name: course.course_name,
          status: course.status,
          schedule: course.schedule,
          court_id: course.court_id,
        });
      }
    }

    // Kiểm tra có thể tạo attendance không
    let can_create_attendance = false;
    let reason = '';

    if (!subscription || !subscription.start_date) {
      reason = !subscription
        ? 'Chưa có subscription'
        : 'Subscription chưa có start_date';
    } else if (courses.length === 0) {
      reason = 'Chưa tham gia lớp nào';
    } else {
      can_create_attendance = true;
      reason = 'Đủ điều kiện để tạo attendance';
    }

    return {
      student_id: student.id,
      student_name: student.name,
      has_subscription: !!subscription,
      subscription: subscriptionInfo,
      has_courses: courses.length > 0,
      courses,
      can_create_attendance,
      reason,
    };
  }
}
