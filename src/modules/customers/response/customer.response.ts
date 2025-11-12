import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  gender: boolean;

  @ApiProperty()
  created_at: number;

  @ApiProperty()
  start_date: number;

  @ApiProperty()
  end_date: number;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  sale_id?: number;

  @ApiProperty()
  status_reason?: number;

  @ApiProperty()
  created_by?: string;

  @ApiProperty()
  updated_by?: string;
}

export class GetCustomerResponse extends CreateCustomerResponse {}

export class UpdateCustomerResponse extends CreateCustomerResponse {}

