import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('internal_user')
export class InternalEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @ApiProperty({
    type: String,
  })
  @Column({
    type: 'char',
    length: 256,
  })
  email: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'char',
    length: 7,
    default: 'public',
  })
  type: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'char',
    length: 256,
    default: 'public',
  })
  address: string;

  @ApiProperty()
  @IsPhoneNumber()
  @Column({
    type: 'char',
    length: 256,
    default: '',
  })
  phone: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'char',
    length: 256,
    default: '',
  })
  reset_password_token: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'char',
    length: 256,
    default: '',
  })
  url: string;

  @ApiProperty()
  @IsString()
  @Column({
    type: 'char',
    length: 256,
    default: 'public',
  })
  reset_password_expire: string;

  @IsString()
  @ApiProperty()
  @Column({
    type: 'varchar',
  })
  password: string;

  @IsString()
  @ApiProperty()
  @Column({
    type: 'varchar',
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'boolean',
    nullable: true,
    default: 1,
  })
  status: boolean;

  @ApiProperty()
  @Column({
    type: 'varchar',
    nullable: true,
    default: '',
  })
  refreshToken?: string;

  @ApiProperty()
  @Column({
    type: Date,
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
