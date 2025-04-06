import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BasePaginateResponse<T> {
  docs: T[];

  @ApiProperty({
    type: Number,
  })
  totalDocs: number;

  @ApiProperty({
    type: Number,
  })
  limit: number;

  @ApiProperty({
    type: Boolean,
  })
  hasPrevPage: boolean;

  @ApiProperty({
    type: Boolean,
  })
  hasNextPage: boolean;

  @ApiPropertyOptional({
    type: Number,
  })
  page?: number | undefined;

  @ApiProperty({
    type: Number,
  })
  totalPages: number;

  @ApiProperty({
    type: Number,
  })
  offset: number;

  @ApiPropertyOptional({
    type: Number,
  })
  prevPage?: number | null | undefined;

  @ApiPropertyOptional({
    type: Number,
  })
  nextPage?: number | null | undefined;
}
