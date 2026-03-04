import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourtDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty({
    description: 'Latitude of the court (decimal degrees)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({
    description: 'Longitude of the court (decimal degrees)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  long?: number;
}

export class UpdateCourtDto {
  @ApiProperty()
  @IsNumber()
  courts_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({
    description: 'Latitude of the court (decimal degrees)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({
    description: 'Longitude of the court (decimal degrees)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  long?: number;
}

export class DeleteCourtDto {
  @ApiProperty()
  @IsNumber()
  courts_id: number;
}
