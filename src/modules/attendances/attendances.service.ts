import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ATTENDANCE_STATUS } from 'src/constants/attendance';
import { AttendanceEntity } from './entities/attendance.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { CourseStudentEntity } from '../course-students/entities/course-student.entity';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { PackageEntity } from '../packages/entities/package.entity';
import { UserEntity } from '../users/entities/user.entity';
import {
  CreateAttendanceDto,
  SearchAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';

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
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Tạo attendance tự động khi student có cả course active và subscription
   */
  async autoCreateAttendances(studentId: number): Promise<AttendanceEntity[]> {
    console.log(`[AttendancesService] autoCreateAttendances called for student ${studentId}`);

    // 1. Lấy danh sách course active của student
    const activeCourses = await this.courseStudentRepo.find({
      where: { student_id: studentId, status: true },
    });

    console.log(`[AttendancesService] Found ${activeCourses.length} active courses for student ${studentId}`);

    if (activeCourses.length === 0) {
      console.log(`[AttendancesService] No active courses found, skipping attendance creation`);
      return [];
    }

    // 2. Lấy subscription active của student
    const subscription = await this.subscriptionRepo.findOne({
      where: { user_id: studentId, status: 1, deleted: 0 },
    });

    console.log(`[AttendancesService] Subscription found:`, subscription ? `id=${subscription.subscription_id}, start_date=${subscription.start_date}` : 'none');

    if (!subscription || !subscription.start_date) {
      console.log(`[AttendancesService] No subscription or start_date found, skipping attendance creation`);
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

    // 6. Sắp xếp schedule items theo day và hour
    scheduleItems.sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      return a.hour.localeCompare(b.hour);
    });

    // 7. Tính toán ngày học dựa trên start_date
    const startDate = new Date(subscription.start_date * 1000); // Convert UNIX timestamp to Date
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to our format: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
    const startDay = startDayOfWeek === 0 ? 7 : startDayOfWeek;

    // 8. Tạo attendance records
    const attendances: AttendanceEntity[] = [];
    let sessionCount = 0;
    const totalSessions = pkg.quantity;
    let weekOffset = 0;

    while (sessionCount < totalSessions) {
      for (const item of scheduleItems) {
        if (sessionCount >= totalSessions) {
          break;
        }

        // Tính toán ngày học
        let targetDate: Date;
        if (weekOffset === 0) {
          // Tuần đầu tiên: chỉ tạo từ start_day trở đi
          if (item.day < startDay) {
            continue; // Bỏ qua các ngày trước start_day trong tuần đầu
          }
          const daysToAdd = item.day - startDay;
          targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + daysToAdd);
        } else {
          // Các tuần tiếp theo: tạo đủ tất cả các ngày
          // Tính số ngày từ start_date đến ngày học trong tuần hiện tại
          // Công thức: (weekOffset * 7) + (item.day - startDay)
          // Nếu item.day < startDay, nghĩa là ngày học đã qua trong tuần hiện tại
          // nên cần cộng thêm 7 ngày để đến tuần sau
          let daysToAdd: number;
          if (item.day >= startDay) {
            daysToAdd = weekOffset * 7 + (item.day - startDay);
          } else {
            // item.day < startDay: ngày học đã qua, cần đến tuần sau
            daysToAdd = (weekOffset - 1) * 7 + (7 - startDay + item.day);
          }
          targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + daysToAdd);
        }

        // Kiểm tra xem attendance đã tồn tại chưa
        const dateStr = targetDate.toISOString().split('T')[0];
        const existingAttendance = await this.attendanceRepo.findOne({
          where: {
            student_id: studentId,
            course_id: item.course_id,
            date: dateStr,
            time: item.hour,
          },
        });

        if (!existingAttendance) {
          const attendance = this.attendanceRepo.create({
            student_id: studentId,
            course_id: item.course_id,
            date: dateStr,
            time: item.hour,
            status: ATTENDANCE_STATUS.NOT_CHECKED_IN,
          });
          attendances.push(attendance);
          sessionCount++;
        } else {
          // Nếu đã tồn tại, vẫn tính vào số lượng buổi học
          sessionCount++;
        }
      }
      weekOffset++;
    }

    // 9. Lưu tất cả attendance vào database
    console.log(`[AttendancesService] Prepared ${attendances.length} attendance records to save`);
    if (attendances.length > 0) {
      const saved = await this.attendanceRepo.save(attendances);
      console.log(`[AttendancesService] Successfully saved ${saved.length} attendance records`);
      return saved;
    }

    console.log(`[AttendancesService] No attendance records to save`);
    return [];
  }

  async create(data: CreateAttendanceDto): Promise<AttendanceEntity> {
    const entity = this.attendanceRepo.create({
      ...data,
      status: data.status || ATTENDANCE_STATUS.NOT_CHECKED_IN,
    });
    return await this.attendanceRepo.save(entity);
  }

  async update(data: UpdateAttendanceDto): Promise<AttendanceEntity | null> {
    const entity = await this.attendanceRepo.findOne({
      where: { id: data.id },
    });
    if (!entity) return null;
    Object.assign(entity, data);
    return await this.attendanceRepo.save(entity);
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
    console.log(`[AttendancesService] Starting createAttendancesForAllUsers, role filter: ${role || 'all'}`);

    // 1. Lấy tất cả users (có thể filter theo role)
    const query = this.userRepo.createQueryBuilder('user');
    if (role) {
      query.andWhere('user.role = :role', { role });
    }
    query.andWhere('user.status = :status', { status: true });
    const users = await query.getMany();

    console.log(`[AttendancesService] Found ${users.length} users to process`);

    const result = {
      totalUsers: users.length,
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

    // 2. Xử lý từng user
    for (const user of users) {
      const detail: typeof result.details[0] = {
        userId: user.id,
        userName: user.name || user.username,
        hasActiveCourses: false,
        hasSubscription: false,
        hasStartDate: false,
        attendancesCreated: 0,
        status: 'skipped',
      };

      try {
        // Kiểm tra xem user đã có attendance chưa
        const existingAttendances = await this.attendanceRepo.find({
          where: { student_id: user.id },
          take: 1,
        });

        if (existingAttendances.length > 0) {
          console.log(`[AttendancesService] User ${user.id} already has ${existingAttendances.length} attendances, skipping`);
          detail.status = 'skipped';
          detail.error = 'Already has attendances';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Kiểm tra course active
        const activeCourses = await this.courseStudentRepo.find({
          where: { student_id: user.id, status: true },
        });
        detail.hasActiveCourses = activeCourses.length > 0;

        if (!detail.hasActiveCourses) {
          console.log(`[AttendancesService] User ${user.id} has no active courses, skipping`);
          detail.status = 'skipped';
          detail.error = 'No active courses';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Kiểm tra subscription
        const subscription = await this.subscriptionRepo.findOne({
          where: { user_id: user.id, status: 1, deleted: 0 },
        });
        detail.hasSubscription = !!subscription;
        detail.hasStartDate = !!(subscription && subscription.start_date);

        if (!subscription || !subscription.start_date) {
          console.log(`[AttendancesService] User ${user.id} has no subscription or start_date, skipping`);
          detail.status = 'skipped';
          detail.error = !subscription ? 'No subscription' : 'No start_date';
          result.skippedUsers++;
          result.details.push(detail);
          continue;
        }

        // Tạo attendance
        const attendances = await this.autoCreateAttendances(user.id);
        detail.attendancesCreated = attendances.length;
        detail.status = 'created';
        result.createdAttendances += attendances.length;
        result.processedUsers++;

        console.log(`[AttendancesService] Created ${attendances.length} attendances for user ${user.id}`);
      } catch (error) {
        console.error(`[AttendancesService] Error processing user ${user.id}:`, error);
        detail.status = 'error';
        detail.error = error.message || 'Unknown error';
        result.skippedUsers++;
      }

      result.details.push(detail);
    }

    console.log(`[AttendancesService] Completed: ${result.processedUsers} processed, ${result.createdAttendances} attendances created, ${result.skippedUsers} skipped`);

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
    // Lấy thông tin user
    const user = await this.userRepo.findOne({
      where: { id: studentId },
    });

    if (!user) {
      throw new Error(`Student with id ${studentId} not found`);
    }

    // Lấy subscription
    const subscription = await this.subscriptionRepo.findOne({
      where: { user_id: studentId, status: 1, deleted: 0 },
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
      reason = !subscription ? 'Chưa có subscription' : 'Subscription chưa có start_date';
    } else if (courses.length === 0) {
      reason = 'Chưa tham gia lớp nào';
    } else {
      can_create_attendance = true;
      reason = 'Đủ điều kiện để tạo attendance';
    }

    return {
      student_id: user.id,
      student_name: user.name || user.username,
      has_subscription: !!subscription,
      subscription: subscriptionInfo,
      has_courses: courses.length > 0,
      courses,
      can_create_attendance,
      reason,
    };
  }
}
