import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subscription')
export class SubscriptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  subscription_id: number;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  user_id: number;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'int', nullable: false })
  package_id: number;

  @ApiProperty({ description: 'Subscription status' })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: 'Status reason (text)', required: false })
  @IsOptional()
  @Column({ type: 'varchar', length: 255, nullable: true })
  status_reason?: string;

  @ApiProperty({ description: 'Purchased quantity' })
  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ApiProperty({
    type: 'bigint',
    description: 'Created timestamp as UNIX time (seconds)',
  })
  @Column({ type: 'bigint', nullable: true, default: () => 'UNIX_TIMESTAMP()' })
  created_at: number;

  @ApiProperty({
    type: 'bigint',
    description: 'Updated timestamp as UNIX time (seconds)',
  })
  @IsOptional()
  @Column({ type: 'bigint', nullable: true })
  updated_at?: number;

  @ApiProperty({ description: 'Soft delete flag' })
  @IsOptional()
  @Column({ type: 'tinyint', default: 0 })
  deleted?: number;
}
