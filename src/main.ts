import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ServiceAccount } from 'firebase-admin';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception/allExceptionFilter';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  const adminConfig: ServiceAccount = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    privateKey: configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });

  app.setGlobalPrefix('/api');

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  await app.listen(1234);
}
bootstrap();
