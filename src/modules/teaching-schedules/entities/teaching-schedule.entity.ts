import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teaching_schedule')
export class TeachingScheduleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty({ description: 'Ref to public_user.id' })
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @IsNumber()
  @ApiProperty({ description: 'Ref to course.id' })
  @Column({ type: 'int', nullable: false })
  course_id: number;

  @IsString()
  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @Column({ type: 'date', nullable: false })
  date: string;

  @IsString()
  @ApiProperty({ description: 'Time (HH:mm)' })
  @Column({ type: 'varchar', length: 10, nullable: false })
  time: string;

  @IsString()
  @ApiProperty({
    description: 'Status: UPCOMING | NOT_CHECKED_IN | CHECKED_IN | CHECKED_OUT',
  })
  @Column({ type: 'varchar', length: 50, default: 'UPCOMING', nullable: false })
  status: string;

  @ApiProperty({ type: Date, description: 'Check-in time', required: false })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true })
  checkin_time?: Date;

  @ApiProperty({ type: Date, description: 'Check-out time', required: false })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true })
  checkout_time?: Date;

  @ApiProperty({ type: Date, description: 'Creation date' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date?: Date;
}


