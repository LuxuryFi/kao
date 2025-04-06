import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/access-token.guard';

export function Auth() {
  return applyDecorators(ApiBearerAuth(), UseGuards(AccessTokenGuard));
}
