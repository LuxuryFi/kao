import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('course')
export class CourseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 256 })
  course_name: string;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'int' })
  quantity: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  summary: string;

  @IsString()
  @ApiProperty({ description: 'JSON string, e.g. { day: [2,3,4], hour: "14:00" }' })
  @Column({ type: 'text' })
  schedule: string;

  @IsNumber()
  @ApiProperty({ description: 'Expiration in months' })
  @Column({ type: 'int' })
  expired: number;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'bigint' })
  price: number;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  created_at: number;
}


