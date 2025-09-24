import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('court')
export class CourtEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 256 })
  name: string;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 256 })
  address: string;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 128 })
  city: string;

  @IsString()
  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 128 })
  district: string;

  @ApiProperty({ type: Number, description: 'UNIX timestamp (ms or sec)' })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  created_at: number;
}


