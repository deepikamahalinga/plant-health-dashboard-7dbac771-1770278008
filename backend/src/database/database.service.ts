import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pooling configuration
      connectionLimit: 20,
      poolTimeout: 30,
      // Additional Prisma options
      errorFormat: 'minimal',
      rejectOnNotFound: false,
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Enable query logging in development
      if (process.env.NODE_ENV === 'development') {
        this.$use(async (params, next) => {
          const before = Date.now();
          const result = await next(params);
          const after = Date.now();
          this.logger.debug(
            `Query ${params.model}.${params.action} took ${after - before}ms`
          );
          return result;
        });
      }
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
      throw error;
    }
  }

  /**
   * Helper method for database health checks
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new HealthCheckError(
        'Database health check failed',
        error
      );
    }
  }

  /**
   * Helper method for transaction management
   */
  async executeInTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.$transaction(async (prisma) => {
        return await fn(prisma);
      }, {
        maxWait: 5000, // max time to wait for transaction to start
        timeout: 10000, // max time for entire transaction
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      });
    } catch (error) {
      this.logger.error('Transaction failed', error);
      throw error;
    }
  }

  /**
   * Helper method to safely execute database operations with retries
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (!this.isRetryableError(error)) {
          throw error;
        }
        await this.delay(Math.pow(2, i) * 100); // exponential backoff
      }
    }
    throw lastError;
  }

  /**
   * Helper method to check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'P1001', // Connection error
      'P1002', // Connection timed out
      'P1008', // Operation timed out
      'P1017', // Server closed the connection
      '40001', // Serialization failure
      '40P01', // Deadlock detected
    ];
    return retryableCodes.includes(error?.code);
  }

  /**
   * Helper method for implementing delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper method to check connection status
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}