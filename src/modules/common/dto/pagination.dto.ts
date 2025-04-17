import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ default: 0, description: 'Page number (starts from 0)' })
  skip: number = 0;  // Default to 0 for the skip value

  @ApiProperty({ default: 20, description: 'Items per page' })
  select: number = 20;  // Default to 20 for items per page
}
