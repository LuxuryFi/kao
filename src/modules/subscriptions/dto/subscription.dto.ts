import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsInt()
  user_id: number;

  @ApiProperty()
  @IsInt()
  package_id: number;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status_reason?: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty()
  @IsInt()
  subscription_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status_reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;
}

export class SearchSubscriptionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  package_id?: number;
}
