import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendance')
export class AttendanceEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty({ description: 'Student ID (references student.id)' })
  @Column({ type: 'int', nullable: false })
  student_id: number;

  @IsNumber()
  @ApiProperty({ description: 'Course ID' })
  @Column({ type: 'int', nullable: false })
  course_id: number;

  @ApiProperty({ description: 'Date of attendance (YYYY-MM-DD format)' })
  @IsString()
  @Column({ type: 'date', nullable: false })
  date: string;

  @ApiProperty({ description: 'Time of attendance (HH:mm format)' })
  @IsString()
  @Column({ type: 'varchar', length: 10, nullable: false })
  time: string;

  @ApiProperty({
    description: 'Attendance status',
    enum: ['ABSENT_NO_REASON', 'ABSENT_WITH_REASON', 'NOT_CHECKED_IN', 'CHECKED_IN'],
    default: 'NOT_CHECKED_IN',
  })
  @IsString()
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'NOT_CHECKED_IN',
  })
  status: string;

  @ApiProperty({ type: Date, description: 'Creation date' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date?: Date;

  @ApiProperty({
    description: 'Is trial attendance (true if manually created as trial, false if auto-created)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', default: false, nullable: false })
  is_trial: boolean;
}
