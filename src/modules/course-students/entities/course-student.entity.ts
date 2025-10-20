import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course_student')
export class CourseStudentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty({ description: 'Student ID (User ID)' })
  @Column({ type: 'int' })
  student_id: number;

  @IsNumber()
  @ApiProperty({ description: 'Course ID' })
  @Column({ type: 'int' })
  course_id: number;

  @ApiProperty({
    description: 'Status: true=active, false=inactive',
    default: true,
  })
  @IsBoolean()
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date?: Date;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true, default: () => 'UNIX_TIMESTAMP()' })
  created_at?: number;

  @ApiProperty({ description: 'Created by username', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', length: 256, nullable: true })
  created_by?: string;

  @ApiProperty({ description: 'Updated by username', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', length: 256, nullable: true })
  updated_by?: string;
}

