import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('package')
export class PackageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  @ApiProperty()
  package_id: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 256 })
  package_name: string;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'int' })
  quantity: number;

  @IsNumber()
  @ApiProperty()
  @Column({ type: 'float' })
  price: number;

  @IsString()
  @ApiProperty()
  @Column({ type: 'varchar', length: 512 })
  summary: string;

  @ApiProperty({ type: Date, description: 'Creation date' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_date: Date;

  @ApiProperty({ description: 'Package status: 1=active, 0=inactive' })
  @IsBoolean()
  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
