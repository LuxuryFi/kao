import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer')
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'char', length: 256 })
  username: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'char', length: 256, default: 'public' })
  address: string;

  @IsEmail()
  @ApiProperty()
  @Column({ type: 'char', length: 256, default: '' })
  email: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'char', length: 256, default: '' })
  url: string;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: true, default: 1 })
  status: boolean;

  @ApiProperty({ description: 'Status reason code', required: false })
  @IsNumber()
  @IsOptional()
  @Column({ type: 'int', nullable: true })
  status_reason?: number;

  @IsBoolean()
  @ApiProperty({ nullable: true, description: 'gender' })
  @Column({ type: 'boolean', nullable: true })
  gender: boolean;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @Column({ type: 'bigint', nullable: true, default: () => 'UNIX_TIMESTAMP()' })
  created_at: number;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  start_date: number;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  end_date: number;

  @ApiProperty({ description: 'Sale id', required: false })
  @IsOptional()
  @Column({ type: 'int', nullable: true })
  sale_id?: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  phone?: string;

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
