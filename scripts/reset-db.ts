import 'dotenv/config';

import * as configLib from 'config';
import mysql from 'mysql2/promise';
import { DataSource } from 'typeorm';

import { AttendanceEntity } from '../src/modules/attendances/entities/attendance.entity';
import { CourseStudentEntity } from '../src/modules/course-students/entities/course-student.entity';
import { CourseEntity } from '../src/modules/courses/entities/course.entity';
import { CourtEntity } from '../src/modules/courts/entities/court.entity';
import { PackageEntity } from '../src/modules/packages/entities/package.entity';
import { StudentEntity } from '../src/modules/students/entities/student.entity';
import { SubscriptionEntity } from '../src/modules/subscriptions/entities/subscription.entity';
import { UserEntity } from '../src/modules/users/entities/user.entity';

function getCfg<T = unknown>(key: string): T | undefined {
  try {
    const v = (configLib as any).get(key);
    return v === null || v === '' ? undefined : (v as T);
  } catch {
    return undefined;
  }
}

function required(name: string, value: unknown): string {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required config: ${name}`);
  }
  return String(value);
}

async function main() {
  const host = required('DB_HOST (or config db.host)', process.env.DB_HOST ?? getCfg('db.host'));
  const port = Number(process.env.DB_PORT ?? getCfg('db.port') ?? 3306);
  const username = required(
    'DB_USERNAME (or config db.username)',
    process.env.DB_USERNAME ?? getCfg('db.username'),
  );
  const password = String(process.env.DB_PASSWORD ?? getCfg('db.password') ?? '');
  const database = required(
    'DB_DATABASE (or config db.database)',
    process.env.DB_DATABASE ?? getCfg('db.database'),
  );

  // 1) Try to drop & recreate DB (fast + clean). If permission is missing, we’ll fall back to dropSchema.
  try {
    const adminConn = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      multipleStatements: true,
    });

    await adminConn.query(
      `DROP DATABASE IF EXISTS \`${database}\`; CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    await adminConn.end();
    // eslint-disable-next-line no-console
    console.log(`[reset-db] Dropped & recreated database: ${database}`);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.warn(
      `[reset-db] Could not DROP/CREATE database (will fallback to dropSchema+synchronize). Reason: ${
        e?.message ?? e
      }`,
    );
  }

  // 2) Recreate tables from entities (dropSchema=true via synchronize(true))
  const ds = new DataSource({
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    charset: 'utf8mb4',
    entities: [
      UserEntity,
      StudentEntity,
      CourtEntity,
      CourseEntity,
      CourseStudentEntity,
      PackageEntity,
      SubscriptionEntity,
      AttendanceEntity,
    ],
    logging: false,
  });

  await ds.initialize();
  await ds.synchronize(true);
  await ds.destroy();

  // eslint-disable-next-line no-console
  console.log('[reset-db] Done. All tables were dropped and recreated from TypeORM entities.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[reset-db] Failed:', err);
  process.exit(1);
});


