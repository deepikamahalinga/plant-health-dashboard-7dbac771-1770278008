// types/custom-error.types.ts
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  details?: unknown;
}

// filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { ValidationError } from 'class-validator';
import { ErrorResponse } from '../types/custom-error.types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly isProduction = process.env.NODE_ENV === 'production',
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Prepare error response
    const errorResponse = this.prepareErrorResponse(exception, request);

    // Log error (in non-production, include stack trace)
    this.logError(exception, errorResponse);

    // Send response
    httpAdapter.reply(ctx.getResponse(), errorResponse, errorResponse.statusCode);
  }

  private prepareErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message;
      error = exception.name;
      details = typeof response === 'object' ? response : undefined;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Handle validation errors specifically
    if (this.isValidationError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      details = this.formatValidationErrors(exception as ValidationError[]);
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request.headers['x-correlation-id'] as string,
    };

    // Add details only in non-production environment
    if (!this.isProduction && details) {
      errorResponse.details = details;
    }

    return errorResponse;
  }

  private isValidationError(exception: unknown): boolean {
    return (
      Array.isArray(exception) &&
      exception.length > 0 &&
      exception[0] instanceof ValidationError
    );
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};
    
    const formatError = (error: ValidationError) => {
      if (error.constraints) {
        formattedErrors[error.property] = Object.values(error.constraints);
      }
      if (error.children?.length) {
        error.children.forEach(formatError);
      }
    };

    errors.forEach(formatError);
    return formattedErrors;
  }

  private logError(exception: unknown, errorResponse: ErrorResponse): void {
    const errorLog = {
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (errorResponse.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('[Error]:', errorLog);
    } else {
      console.warn('[Warning]:', errorLog);
    }
  }
}

// main.ts (setup)
import { NestFactory } from '@nestjs/core';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  
  await app.listen(3000);
}
bootstrap();

// Usage example in a controller
import { Controller, Get, NotFoundException } from '@nestjs/common';

@Controller('items')
export class ItemsController {
  @Get(':id')
  findOne(id: string) {
    throw new NotFoundException(`Item with id ${id} not found`);
    // Will be caught by AllExceptionsFilter and formatted appropriately
  }
}