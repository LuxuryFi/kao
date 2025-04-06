import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

interface CommonHttpException {
  error?: string;
  code?: number;
}

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(AnyExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionResponse: CommonHttpException | any = exception;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      exceptionResponse = exception.getResponse() as CommonHttpException;
    } else if (exception?.[0] instanceof ValidationError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      if (exception[0].constraints)
        exceptionResponse = Object.values(exception[0].constraints)
          .join(', ')
          .trim();
    }

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { error: exception?.message ?? exception },
        'Caught exception',
      );
    }

    response.status(httpStatus).json({
      ...(typeof exceptionResponse !== 'string' && exceptionResponse),
      statusCode: httpStatus,
      httpStatus,
      ...(exceptionResponse?.error && { error: exceptionResponse?.error }),
      ...(exceptionResponse?.message && {
        message: exceptionResponse?.message,
      }),
      code: exceptionResponse?.code
        ? `${httpStatus}${exceptionResponse.code}`
        : String(httpStatus),
    });
  }
}
