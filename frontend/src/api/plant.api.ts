// plant.api.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface Plant {
  id: string;
  healthStatus: HealthStatus;
}

export interface CreatePlantDto {
  healthStatus: HealthStatus;
}

export interface UpdatePlantDto {
  healthStatus: HealthStatus;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: keyof Plant;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  healthStatus?: HealthStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Error handling
export class PlantApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: any
  ) {
    super(message);
    this.name = 'PlantApiError';
  }
}

// API Client
export class PlantApiClient {
  private client: AxiosInstance;
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;
    
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError
    );
  }

  private async handleError(error: AxiosError) {
    if (error.response) {
      throw new PlantApiError(
        error.response.status,
        error.response.data?.message || 'An error occurred',
        error.response.data
      );
    }
    throw new PlantApiError(500, error.message || 'Network error');
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < PlantApiClient.MAX_RETRIES; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (error instanceof PlantApiError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error; // Don't retry client errors
        }
        await new Promise(resolve => 
          setTimeout(resolve, PlantApiClient.RETRY_DELAY * Math.pow(2, i))
        );
      }
    }
    throw lastError!;
  }

  async getAllPlants(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<Plant>> {
    return this.retryOperation(async () => {
      const { data } = await this.client.get('/plants', {
        params: {
          ...filters,
          ...pagination,
          ...sort,
        },
      });
      return data;
    });
  }

  async getPlantById(id: string): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.get(`/plants/${id}`);
      return data;
    });
  }

  async createPlant(plantData: CreatePlantDto): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.post('/plants', plantData);
      return data;
    });
  }

  async updatePlant(id: string, plantData: UpdatePlantDto): Promise<Plant> {
    return this.retryOperation(async () => {
      const { data } = await this.client.put(`/plants/${id}`, plantData);
      return data;
    });
  }

  async deletePlant(id: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.client.delete(`/plants/${id}`);
    });
  }
}

// Export singleton instance
export const plantApi = new PlantApiClient();

// Hook for handling loading states (if using React)
export const useApiState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PlantApiError | null>(null);

  const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const apiError = err as PlantApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, withLoading };
};