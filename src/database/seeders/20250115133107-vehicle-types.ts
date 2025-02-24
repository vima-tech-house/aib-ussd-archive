import { Seeder } from 'interfaces/seeder.interface';
import { QueryInterface, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface VehicleTypeBase {
  name: string;
  code: string;
  description: string;
  makeId: string;
}

interface VehicleTypeComplete extends VehicleTypeBase {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface VehicleMake {
  id: string;
  [key: string]: any;
}

const seeder: Seeder = {
  up: async (
    queryInterface: QueryInterface,
    _Sequelize: any,
  ): Promise<void> => {
    const vehicleMakes = (await queryInterface.sequelize.query(
      `SELECT id FROM vehicle_makes LIMIT 1;`,
      { type: 'SELECT' as any },
    )) as unknown as VehicleMake[];

    if (!vehicleMakes.length) {
      throw new Error(
        'No vehicle makes found. Please run vehicle-makes seeder first.',
      );
    }

    const makeId = vehicleMakes[0].id;

    const baseTypes: VehicleTypeBase[] = [
      {
        name: 'Private Car',
        code: 'PRIVATE_CAR',
        description: 'Standard private passenger vehicle',
        makeId: makeId,
      },
      {
        name: 'SUV Private',
        code: 'SUV_PRIVATE',
        description: 'Sport Utility Vehicle for private use',
        makeId: makeId,
      },
      {
        name: 'Pickup Private',
        code: 'PICKUP_PRIVATE',
        description: 'Pickup truck for private use',
        makeId: makeId,
      },
      {
        name: 'Truck',
        code: 'TRUCK',
        description: 'Commercial truck',
        makeId: makeId,
      },
      {
        name: 'Bus',
        code: 'BUS',
        description: 'Passenger bus',
        makeId: makeId,
      },
      {
        name: 'Motorcycle',
        code: 'MOTORCYCLE',
        description: 'Two-wheeled motor vehicle',
        makeId: makeId,
      },
    ];

    const types: VehicleTypeComplete[] = baseTypes.map((type) => ({
      id: uuidv4(),
      ...type,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('vehicle_types', types);
  },

  down: async (
    queryInterface: QueryInterface,
    _Sequelize: any,
  ): Promise<void> => {
    await queryInterface.bulkDelete('vehicle_types', {}, {});
  },
};

export default seeder;
