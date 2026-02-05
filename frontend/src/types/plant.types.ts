// plant.types.ts

import { z } from 'zod';

/**
 * Enum representing possible health statuses for a plant
 * @enum {string}
 */
export enum PlantHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

/**
 * Interface representing soil measurement data related to a plant
 */
export interface SoilData {
  id: string;
  plantId: string;
  moisture: number;
  ph: number;
  temperature: number;
  timestamp: Date;
}

/**
 * Main Plant entity interface
 * @interface Plant
 */
export interface Plant {
  /** Unique identifier */
  id: string;
  /** Current health status */
  healthStatus: PlantHealthStatus;
  /** Associated soil measurements */
  soilData?: SoilData[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * DTO for creating a new plant
 * @interface CreatePlantDto
 */
export interface CreatePlantDto {
  healthStatus: PlantHealthStatus;
}

/**
 * DTO for updating an existing plant
 * @type UpdatePlantDto
 */
export type UpdatePlantDto = Partial<CreatePlantDto>;

/**
 * Filter parameters for querying plants
 * @interface PlantFilterParams
 */
export interface PlantFilterParams {
  healthStatus?: PlantHealthStatus;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Pagination parameters
 * @interface PaginationParams
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Sort parameters
 * @interface SortParams
 */
export interface SortParams {
  sortBy: keyof Plant;
  order: 'asc' | 'desc';
}

/**
 * Metadata for paginated responses
 * @interface ResponseMetadata
 */
export interface ResponseMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Generic API response wrapper
 * @interface ApiResponse
 */
export interface ApiResponse<T> {
  data: T;
  metadata?: ResponseMetadata;
  success: boolean;
  message?: string;
}

/**
 * Zod validation schema for Plant entity
 */
export const PlantSchema = z.object({
  id: z.string().uuid(),
  healthStatus: z.nativeEnum(PlantHealthStatus),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Zod validation schema for CreatePlantDto
 */
export const CreatePlantDtoSchema = z.object({
  healthStatus: z.nativeEnum(PlantHealthStatus)
});

/**
 * Zod validation schema for UpdatePlantDto
 */
export const UpdatePlantDtoSchema = CreatePlantDtoSchema.partial();

/**
 * Type for paginated plant list response
 */
export type PaginatedPlantResponse = ApiResponse<{
  plants: Plant[];
  metadata: ResponseMetadata;
}>;

/**
 * Type for single plant response
 */
export type SinglePlantResponse = ApiResponse<Plant>;

/**
 * Utility type for plant list query parameters
 */
export type PlantQueryParams = PlantFilterParams & PaginationParams & SortParams;