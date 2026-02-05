// src/middleware/logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = request;
    const requestId = uuidv4();
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Attach requestId to request object for further use
    request['requestId'] = requestId;

    // Log request
    this.logger.log(
      `[${requestId}] ${method} ${originalUrl} - Started - ${ip} ${userAgent}`
    );

    // Log response when finished
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      const level = statusCode >= 500 ? 'error' : 
                    statusCode >= 400 ? 'warn' : 
                    'log';

      this.logger[level](
        `[${requestId}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${contentLength || 0}b`
      );
    });

    // Log errors
    response.on('error', (error) => {
      this.logger.error(
        `[${requestId}] ${method} ${originalUrl} - ${error.message}`,
        error.stack
      );
    });

    next();
  }
}

// src/interfaces/request.interface.ts
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

// src/config/logger.config.ts
import { LoggerService, LogLevel } from '@nestjs/common';

export class CustomLogger implements LoggerService {
  private readonly environment = process.env.NODE_ENV || 'development';

  /**
   * Get appropriate log levels based on environment
   */
  private getLogLevels(): LogLevel[] {
    if (this.environment === 'production') {
      return ['log', 'warn', 'error'];
    }
    return ['error', 'warn', 'log', 'debug', 'verbose'];
  }

  log(message: string, context?: string) {
    if (this.getLogLevels().includes('log')) {
      console.log(`[${context}] ${message}`);
    }
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context}] ${message}`, trace);
  }

  warn(message: string, context?: string) {
    if (this.getLogLevels().includes('warn')) {
      console.warn(`[${context}] ${message}`);
    }
  }

  debug(message: string, context?: string) {
    if (this.getLogLevels().includes('debug')) {
      console.debug(`[${context}] ${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (this.getLogLevels().includes('verbose')) {
      console.log(`[${context}] ${message}`);
    }
  }
}

// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  
  await app.listen(3000);
}
bootstrap();