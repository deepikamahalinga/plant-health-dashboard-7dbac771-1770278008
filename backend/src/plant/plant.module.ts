// plant.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';
import { Plant } from './entities/plant.entity';
import { SoilDataModule } from '../soil-data/soil-data.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    // Register Plant entity with TypeORM
    TypeOrmModule.forFeature([Plant]),
    
    // Import related modules
    DatabaseModule,
    SoilDataModule,
  ],
  controllers: [PlantController],
  providers: [
    PlantService,
    // Add any additional providers/services needed
  ],
  exports: [PlantService], // Export service for use in other modules
})
export class PlantModule {}