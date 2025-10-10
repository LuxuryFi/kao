import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('public_user')
export class UserEntity extends BaseEntity {
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
  reset_password_token: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'char', length: 256, default: '' })
  url: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'char', length: 256, default: '' })
  role: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'char', length: 256, default: 'public' })
  reset_password_expire: string;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar' })
  password: string;

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

  @ApiProperty()
  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

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

  @ApiProperty({ description: 'Parent user id', required: false })
  @IsOptional()
  @Column({ type: 'int', nullable: true })
  parent_id?: number;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  phone?: string;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @IsOptional()
  @Column({ type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date?: Date;
}
