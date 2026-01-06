import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './modules/app/app.module';
import { CONFIG, getHost } from './modules/config/config.provider';

const validationPipeOptions = {
  transform: true,
  validationError: {
    target: false,
    value: false,
  },
  whitelist: true,
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(CONFIG);

  app
    .use(
      helmet({
        contentSecurityPolicy: false,
      }),
    )
    .enableCors();

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(configService.get('service.baseUrl'));
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
    setHeaders: (res, path) => {
      res.set('Access-Control-Allow-Origin', '*'); // or restrict to your frontend origin
    },                               
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Food Store')
    .setDescription('Food Store - API description')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('server.port'));
}

bootstrap()
  .then(() => {
    const hostname = getHost();
    console.info(`Started on http://${getHost()}/api`);
    console.info(`Docs available on http://${hostname}/docs`);
  })
  .catch((error) => {
    console.error('bootstrap starting error ', error);
  });
