import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { ZodValidationPipe } from 'nestjs-zod';
import { Logger } from '@nestjs/common';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { PrismaService } from './shared/services/prisma.service';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { RateLimiterGuard } from './shared/guards/rate-limiter.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const logger = new Logger('Bootstrap');

  // Enable shutdown hooks
  prismaService.enableShutdownHooks(app);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // Request logging
  app.use(morgan('combined'));

  // Validation & transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new ZodValidationPipe(),
  );

  // Global guards
  app.useGlobalGuards(new RateLimiterGuard());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Request size limits
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Plant Monitoring API')
    .setDescription('API documentation for plant monitoring system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown`);
      
      await app.close();
      await prismaService.$disconnect();
      
      logger.log('Application shut down successfully');
      process.exit(0);
    });
  }
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});