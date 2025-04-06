import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Payload } from '../interface/auth.interface';

export class LoginResponse {
  @IsString()
  @ApiProperty({
    description: 'Access token',
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'Refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'user',
  })
  user: Payload;
}
