import { Provider } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

import * as config from 'config';

export const CONFIG = 'ConfigProviderToken';

export const getHost = () => {
  return `${config.get('server.host')}:${config.get('server.port')}`;
};

export const getConfig = () => {
  return config;
};

export const ConfigProvider: Provider = {
  provide: CONFIG,
  useFactory: () => {
    dotenv.config();
    return import('config');
  },
};
