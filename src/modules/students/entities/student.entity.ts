import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('student')
export class StudentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty({ description: 'Student name' })
  @Column({ type: 'varchar', length: 256 })
  name: string;

  @IsNumber()
  @ApiProperty({ description: 'Student age' })
  @Column({ type: 'int' })
  age: number;

  @IsString()
  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @IsNumber()
  @ApiProperty({ description: 'Parent user ID (references public_user.id)' })
  @Column({ type: 'int', nullable: false })
  parent_id: number;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true, default: () => 'UNIX_TIMESTAMP()' })
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

