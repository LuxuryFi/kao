import { ApiProperty } from '@nestjs/swagger';

class BasePackageResponse {
  @ApiProperty()
  package_id: number;

  @ApiProperty()
  package_name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  updated_date: Date;

  @ApiProperty()
  status: number;
}

export class CreatePackageResponse extends BasePackageResponse {}
export class GetPackageResponse extends BasePackageResponse {}
export class UpdatePackageResponse extends BasePackageResponse {}
export class ListPackageResponse extends BasePackageResponse {}
