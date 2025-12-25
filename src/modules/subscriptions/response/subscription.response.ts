import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponse {
  @ApiProperty()
  subscription_id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  user_name: string;

  @ApiProperty()
  package_id: number;

  @ApiProperty()
  package_name: string;

  @ApiProperty({ description: 'Subscription status' })
  status: number;

  @ApiProperty({ required: false })
  status_reason?: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: 'bigint' })
  created_at: number;

  @ApiProperty({ type: 'bigint' })
  updated_at?: number;

  @ApiProperty({ description: 'Soft delete flag' })
  deleted?: number;
}

