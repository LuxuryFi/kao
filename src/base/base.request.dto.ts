import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class BaseRequestDto {
  @ApiProperty({
    required: false,
    type: String,
  })
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsOptional()
  limit?: number;

  @ApiProperty({
    required: false,
    type: String,
    description: 'sort asc || desc',
    example: 'desc',
  })
  @IsOptional()
  sort?: string;

  @ApiProperty({
    required: false,
    type: Date,
  })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    required: false,
    type: Date,
  })
  @IsOptional()
  endDate?: Date;
}
