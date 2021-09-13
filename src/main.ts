import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPath = '/api/documentation';
  app.use(
    apiPath,
    basicAuth({
      challenge: true,
      users: { apiUser: 'apiPass' },
    }),
  );
  const options = new DocumentBuilder()
    .setTitle('RMP API')
    .setDescription('RMP API Description')
    .setVersion('0.0.1-ALPHA')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(apiPath, app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  await app.listen(1234);
}
bootstrap();
