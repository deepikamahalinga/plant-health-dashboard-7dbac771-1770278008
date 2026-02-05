import { PrismaClient, Plant, SoilData } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger'; // Assume a logging utility

const prisma = new PrismaClient();
const logger = new Logger('database-seed');

// Types
type SeedOptions = {
  clearExisting?: boolean;
  confirmClear?: boolean;
};

// Sample data
const SAMPLE_PLANTS: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { healthStatus: 'healthy' },
  { healthStatus: 'warning' },
  { healthStatus: 'critical' },
  { healthStatus: 'healthy' },
  { healthStatus: 'warning' },
];

async function clearDatabase(confirm: boolean = false) {
  if (!confirm) {
    throw new Error('Database clear not confirmed. Set confirmClear to true to proceed.');
  }

  logger.info('Clearing existing database records...');
  
  try {
    // Delete in correct order to respect foreign keys
    await prisma.soilData.deleteMany();
    await prisma.plant.deleteMany();
    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Error clearing database:', error);
    throw error;
  }
}

async function seedPlants(): Promise<Plant[]> {
  logger.info('Seeding plants...');
  const plants: Plant[] = [];

  try {
    for (const plantData of SAMPLE_PLANTS) {
      const plant = await prisma.plant.create({
        data: {
          id: uuidv4(),
          ...plantData,
        },
      });
      plants.push(plant);
      logger.info(`Created plant with ID: ${plant.id}`);
    }
    return plants;
  } catch (error) {
    logger.error('Error seeding plants:', error);
    throw error;
  }
}

async function seedSoilData(plants: Plant[]) {
  logger.info('Seeding soil data...');

  try {
    for (const plant of plants) {
      // Create 5 soil measurements per plant
      for (let i = 0; i < 5; i++) {
        await prisma.soilData.create({
          data: {
            plantId: plant.id,
            // Add other soil data fields here
          },
        });
      }
    }
    logger.info('Soil data seeded successfully');
  } catch (error) {
    logger.error('Error seeding soil data:', error);
    throw error;
  }
}

export async function seed(options: SeedOptions = {}) {
  const { clearExisting = false, confirmClear = false } = options;

  try {
    logger.info('Starting database seed...');

    if (clearExisting) {
      await clearDatabase(confirmClear);
    }

    const plants = await seedPlants();
    await seedSoilData(plants);

    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// For direct execution (e.g., npm run seed)
if (require.main === module) {
  seed({ clearExisting: true, confirmClear: true })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}