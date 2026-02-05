import { z } from 'zod';

/**
 * Enum representing possible plant health status values
 */
export const PlantHealthStatus = {
  HEALTHY: 'healthy',
  WARNING: 'warning', 
  CRITICAL: 'critical'
} as const;

/**
 * Zod schema for creating a new plant
 */
export const CreatePlantDtoSchema = z.object({
  /**
   * Current health status of the plant
   * @example "healthy"
   */
  healthStatus: z.enum([
    PlantHealthStatus.HEALTHY,
    PlantHealthStatus.WARNING,
    PlantHealthStatus.CRITICAL
  ], {
    required_error: "Health status is required",
    invalid_type_error: "Health status must be one of: healthy, warning, critical"
  })
});

/**
 * Type representing the create plant DTO
 */
export type CreatePlantDto = z.infer<typeof CreatePlantDtoSchema>;

/**
 * Type representing valid plant health status values
 */
export type PlantHealthStatusType = keyof typeof PlantHealthStatus;