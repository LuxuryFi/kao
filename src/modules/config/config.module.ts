import { Module } from '@nestjs/common';

import { ConfigProvider as configProvider } from './config.provider';

@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
