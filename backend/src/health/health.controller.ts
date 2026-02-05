// src/health/interfaces/health-check.interface.ts
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
}

// src/health/health.controller.ts
import { Controller, Get, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckResult } from './interfaces/health-check.interface';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const health = await this.healthService.checkHealth();
    
    if (health.status === 'unhealthy') {
      throw new ServiceUnavailableException(health);
    }
    
    return health;
  }
}

// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { HealthCheckResult } from './interfaces/health-check.interface';

@Injectable()
export class HealthService {
  private startTime: number;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    this.startTime = Date.now();
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const [dbStatus, dbLatency] = await this.checkDatabase();
    const memoryUsage = this.checkMemory();
    
    const status = this.evaluateOverallHealth(dbStatus, memoryUsage.percentage);

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000), // uptime in seconds
      memory: memoryUsage,
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
    };
  }

  private async checkDatabase(): Promise<['connected' | 'disconnected', number]> {
    try {
      const start = Date.now();
      await this.connection.query('SELECT 1');
      const latency = Date.now() - start;
      return ['connected', latency];
    } catch (error) {
      return ['disconnected', 0];
    }
  }

  private checkMemory() {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    const percentage = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage),
    };
  }

  private evaluateOverallHealth(
    dbStatus: 'connected' | 'disconnected',
    memoryPercentage: number,
  ): 'healthy' | 'unhealthy' {
    if (dbStatus === 'disconnected' || memoryPercentage > 90) {
      return 'unhealthy';
    }
    return 'healthy';
  }
}

// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}