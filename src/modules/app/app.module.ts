import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IConfig } from 'config';
import { LoggerModule } from 'nestjs-pino';
import { AnyExceptionFilter } from 'src/filters/any-exception.filter';
import { loggerConfig } from 'src/shared/logger.helper';
import { getMetadataArgsStorage } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { CONFIG } from '../config/config.provider';
import { CourseStudentsModule } from '../course-students/course-students.module';
import { CoursesModule } from '../courses/courses.module';
import { CourtsModule } from '../courts/courts.module';
import { CustomersModule } from '../customers/customers.module';
import { PackagesModule } from '../packages/packages.module';
import { UserModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CONFIG],
      useFactory: (config: IConfig) =>
        loggerConfig(process.env.NODE_ENV, config.get('logger.autoLogging')),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CONFIG],
      useFactory: (config: IConfig): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: config.get<string>('db.host'),
        port: config.get<number>('db.port'),
        username: config.get<string>('db.username'),
        password: config.get<string>('db.password'),
        database: config.get<string>('db.database'),
        entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
      }),
    }),
    AuthModule,
    UserModule,
    CustomersModule,
    CourtsModule,
    CoursesModule,
    CourseStudentsModule,
    PackagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AnyExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
