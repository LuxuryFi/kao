import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course_staff')
export class CourseStaffEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty({ description: 'Ref to course.id' })
  @Column({ type: 'int', nullable: false })
  course_id: number;

  @IsNumber()
  @ApiProperty({ description: 'Ref to public_user.id' })
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @IsString()
  @ApiProperty({ description: 'LEAD | SUB_TUTOR | MANAGER' })
  @Column({ type: 'varchar', length: 20, nullable: false })
  role: string;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  created_at?: number;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date?: Date;

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


