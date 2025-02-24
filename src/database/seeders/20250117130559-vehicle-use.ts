import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface VehicleUse {
  id: string;
  usage_type: string;
  created_at: Date;
  updated_at: Date;
}

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const vehicleUses: VehicleUse[] = [
      { usage_type: 'Private' },
      { usage_type: 'Commercial' },
      { usage_type: 'Taxi' },
      { usage_type: 'For Hire' },
    ].map((use) => ({
      id: uuidv4(),
      ...use,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('vehicle_uses', vehicleUses);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('vehicle_uses', {});
  },
};
