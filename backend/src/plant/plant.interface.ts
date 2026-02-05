/**
 * Enum representing possible plant health status values
 * @enum {string}
 */
export enum PlantHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning', 
  CRITICAL = 'critical'
}

/**
 * Interface representing a soil data measurement related to a plant
 */
export interface SoilData {
  id: string;
  plantId: string;
  // Other soil data fields would go here
}

/**
 * Interface representing a plant entity in the system
 * @interface Plant
 */
export interface Plant {
  /**
   * Unique identifier for the plant
   * @type {string}
   */
  id: string;

  /**
   * Current health status of the plant
   * Must be updated at least daily
   * Critical status triggers immediate alerts
   * @type {PlantHealthStatus}
   */
  healthStatus: PlantHealthStatus;

  /**
   * Related soil measurements for this plant
   * @type {SoilData[]}
   */
  soilData?: SoilData[];
}

/**
 * Type for creating a new plant
 * Omits auto-generated fields
 */
export type CreatePlantDto = Omit<Plant, 'id' | 'soilData'>;

/**
 * Type for updating an existing plant
 * Makes all fields optional except id
 */
export type UpdatePlantDto = Partial<Omit<Plant, 'id' | 'soilData'>> & {
  id: string;
};

/**
 * Type for plant response with related data
 */
export type PlantWithRelations = Plant & {
  soilData: SoilData[];
};

/**
 * Type for filtering plants by health status
 */
export type PlantHealthFilter = {
  healthStatus: PlantHealthStatus;
};