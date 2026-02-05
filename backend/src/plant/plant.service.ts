// src/plants/types/plant.types.ts
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface CreatePlantDto {
  id?: string; // UUID will be generated if not provided
  healthStatus: HealthStatus;
}

export interface UpdatePlantDto {
  healthStatus?: HealthStatus;
}

export interface PlantFilters {
  healthStatus?: HealthStatus;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

// src/plants/plant.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plant, Prisma } from '@prisma/client';
import { CreatePlantDto, UpdatePlantDto, PlantFilters, PaginationParams } from './types/plant.types';

@Injectable()
export class PlantService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: PlantFilters, pagination?: PaginationParams): Promise<Plant[]> {
    const where: Prisma.PlantWhereInput = {
      ...(filters?.healthStatus && { healthStatus: filters.healthStatus }),
    };

    return this.prisma.plant.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        soilData: true, // Include related soil measurements
      },
      orderBy: {
        // Default ordering by latest updates
        updatedAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Plant> {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        soilData: true,
      },
    });

    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    return plant;
  }

  async create(data: CreatePlantDto): Promise<Plant> {
    return this.prisma.plant.create({
      data: {
        ...data,
        id: data.id || undefined, // Allow custom ID or let Prisma generate UUID
      },
      include: {
        soilData: true,
      },
    });
  }

  async update(id: string, data: UpdatePlantDto): Promise<Plant> {
    try {
      return await this.prisma.plant.update({
        where: { id },
        data,
        include: {
          soilData: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') { // Record not found error
          throw new NotFoundException(`Plant with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<Plant> {
    try {
      return await this.prisma.plant.delete({
        where: { id },
        include: {
          soilData: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Plant with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // Additional utility method for health status queries
  async findByHealthStatus(status: HealthStatus): Promise<Plant[]> {
    return this.prisma.plant.findMany({
      where: {
        healthStatus: status,
      },
      include: {
        soilData: true,
      },
    });
  }
}