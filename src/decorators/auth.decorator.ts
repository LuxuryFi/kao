import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/access-token.guard';

/**
 * Decorator that combines @UseGuards(AccessTokenGuard) and @ApiBearerAuth('JWT-auth')
 * Use this instead of separate decorators for cleaner code
 */
export function Auth() {
  return applyDecorators(
    UseGuards(AccessTokenGuard),
    ApiBearerAuth('JWT-auth'),
  );
}
