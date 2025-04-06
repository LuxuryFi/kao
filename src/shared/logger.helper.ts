import { Params } from 'nestjs-pino';
import * as pino from 'pino';

export function loggerConfig(env: string, auto: boolean): Params {
  return {
    pinoHttp: {
      serializers: {
        err: pino.stdSerializers.err,
        req: (req) => {
          req.body = req.raw.body;
          return req;
        },
      },
      autoLogging: auto,
      transport: !env ? { target: 'pino-pretty' } : undefined,
    },
  };
}
