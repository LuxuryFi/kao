import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from '../packages/entities/package.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { AttendancesService } from '../attendances/attendances.service';
import {
  CreateSubscriptionDto,
  SearchSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    @InjectRepository(PackageEntity)
    private readonly packageRepo: Repository<PackageEntity>,
    @Inject(forwardRef(() => AttendancesService))
    private readonly attendancesService: AttendancesService,
  ) {}

  async create(data: CreateSubscriptionDto) {
    // Validate student_id exists
    if (data.student_id) {
      const student = await this.studentRepo.findOne({
        where: { id: data.student_id },
      });
      if (!student) {
        throw new BadRequestException(
          `Student với ID ${data.student_id} không tồn tại`,
        );
      }
    }

    // Validate package_id exists
    if (data.package_id) {
      const pkg = await this.packageRepo.findOne({
        where: { package_id: data.package_id },
      });
      if (!pkg) {
        throw new BadRequestException(
          `Package với ID ${data.package_id} không tồn tại`,
        );
      }
    }

    const created_at = Math.floor(Date.now() / 1000);
    const entity = this.subscriptionRepo.create({
      ...data,
      status: 1,
      created_at,
    });
    const result = await this.subscriptionRepo.save(entity);

    // Tự động tạo attendance nếu student đã có course active
    if (result && result.student_id) {
      try {
        console.log(
          `[SubscriptionsService] Triggering auto-create attendances for student ${result.student_id}`,
        );
        const attendances = await this.attendancesService.autoCreateAttendances(
          result.student_id,
        );
        console.log(
          `[SubscriptionsService] Created ${attendances.length} attendances for student ${result.student_id}`,
        );
      } catch (error) {
        console.error(
          '[SubscriptionsService] Error auto-creating attendances:',
          error,
        );
        console.error('[SubscriptionsService] Error stack:', error.stack);
        // Không throw error để không ảnh hưởng đến việc tạo subscription
      }
    }

    return result;
  }

  async update(data: UpdateSubscriptionDto) {
    const updated_at = Math.floor(Date.now() / 1000);
    const entity = await this.subscriptionRepo.findOne({
      where: { subscription_id: data.subscription_id, deleted: 0 },
    });
    if (!entity) return null;
    Object.assign(entity, data, { updated_at });
    return await this.subscriptionRepo.save(entity);
  }

  async softDelete(id: number) {
    const updated_at = Math.floor(Date.now() / 1000);
    return this.subscriptionRepo.update(id, { deleted: 1, updated_at });
  }

  async getById(id: number) {
    const entity = await this.subscriptionRepo.findOne({
      where: { subscription_id: id, deleted: 0 },
    });
    if (!entity) return null;
    const student = entity.student_id
      ? await this.studentRepo.findOne({ where: { id: entity.student_id } })
      : null;
    const pkg = entity.package_id
      ? await this.packageRepo.findOne({
          where: { package_id: entity.package_id },
        })
      : null;
    return {
      ...entity,
      student_name: student?.name || '',
      package_name: pkg?.package_name || '',
    };
  }

  async getByStudentId(student_id: number) {
    const subs = await this.subscriptionRepo.find({
      where: { student_id, deleted: 0 },
    });
    return Promise.all(
      subs.map(async (s) => {
        const pkg = s.package_id
          ? await this.packageRepo.findOne({
              where: { package_id: s.package_id },
            })
          : null;
        return {
          ...s,
          student_name: '',
          package_name: pkg?.package_name || '',
        };
      }),
    );
  }

  async getByPackageId(package_id: number) {
    const subs = await this.subscriptionRepo.find({
      where: { package_id, deleted: 0 },
    });
    return Promise.all(
      subs.map(async (s) => {
        const student = s.student_id
          ? await this.studentRepo.findOne({ where: { id: s.student_id } })
          : null;
        return { ...s, student_name: student?.name || '', package_name: '' };
      }),
    );
  }

  async getStudentListBySubscription(subscription_id: number) {
    const sub = await this.subscriptionRepo.findOne({
      where: { subscription_id, deleted: 0 },
    });
    if (!sub) return [];
    return this.studentRepo.find({ where: { id: sub.student_id } });
  }

  async search(query: SearchSubscriptionDto) {
    const qb = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .where('subscription.deleted = 0');
    if (query.student_id)
      qb.andWhere('subscription.student_id = :student_id', {
        student_id: query.student_id,
      });
    if (query.package_id)
      qb.andWhere('subscription.package_id = :package_id', {
        package_id: query.package_id,
      });
    const subs = await qb.getMany();
    return Promise.all(
      subs.map(async (s) => {
        const student = s.student_id
          ? await this.studentRepo.findOne({ where: { id: s.student_id } })
          : null;
        const pkg = s.package_id
          ? await this.packageRepo.findOne({
              where: { package_id: s.package_id },
            })
          : null;
        return {
          ...s,
          student_name: student?.name || '',
          package_name: pkg?.package_name || '',
        };
      }),
    );
  }

  async list() {
    const subs = await this.subscriptionRepo.find({ where: { deleted: 0 } });
    return Promise.all(
      subs.map(async (s) => {
        const student = s.student_id
          ? await this.studentRepo.findOne({ where: { id: s.student_id } })
          : null;
        const pkg = s.package_id
          ? await this.packageRepo.findOne({
              where: { package_id: s.package_id },
            })
          : null;
        return {
          ...s,
          student_name: student?.name || '',
          package_name: pkg?.package_name || '',
        };
      }),
    );
  }
}
