import { 
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  HttpException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Plant } from './entities/plant.entity';

@Controller('plants')
@UseGuards(JwtAuthGuard)
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Get()
  async getAllPlants(@Query() paginationQuery: PaginationQueryDto): Promise<{
    items: Plant[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      return await this.plantService.findAll(paginationQuery);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch plants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getPlantById(@Param('id', ParseUUIDPipe) id: string): Promise<Plant> {
    try {
      const plant = await this.plantService.findById(id);
      if (!plant) {
        throw new HttpException('Plant not found', HttpStatus.NOT_FOUND);
      }
      return plant;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch plant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createPlant(@Body() createPlantDto: CreatePlantDto): Promise<Plant> {
    try {
      return await this.plantService.create(createPlantDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create plant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updatePlant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<Plant> {
    try {
      const plant = await this.plantService.update(id, updatePlantDto);
      if (!plant) {
        throw new HttpException('Plant not found', HttpStatus.NOT_FOUND);
      }
      return plant;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to update plant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deletePlant(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const result = await this.plantService.delete(id);
      if (!result) {
        throw new HttpException('Plant not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete plant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:healthStatus')
  async getPlantsByHealthStatus(
    @Param('healthStatus') healthStatus: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<{
    items: Plant[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      return await this.plantService.findByHealthStatus(
        healthStatus,
        paginationQuery,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to fetch plants by health status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}