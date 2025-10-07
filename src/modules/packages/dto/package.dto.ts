import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty()
  @IsString()
  package_name: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty({ description: 'Package status: 1=active, 0=inactive', default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class UpdatePackageDto {
  @ApiProperty()
  @IsNumber()
  package_id: number;

  @ApiProperty()
  @IsString()
  package_name: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty({ description: 'Package status: 1=active, 0=inactive' })
  @IsNumber()
  status: number;
}

export class DeletePackageDto {
  @ApiProperty()
  @IsNumber()
  package_id: number;
}
