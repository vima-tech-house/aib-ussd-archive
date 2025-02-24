import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface Feature {
  id: string;
  name: string;
  path: string;
  created_at: Date;
  updated_at: Date;
}

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const baseFeatures = [
      { name: 'Users', path: '/users' },
      { name: 'Policies', path: '/policies' },
      { name: 'Insurers', path: '/insurers' },
      { name: 'Vehicles', path: '/vehicles' },
      { name: 'Quotations', path: '/quotations' },
      { name: 'Accounts', path: '/accounts' },
      { name: 'Insights', path: '/insights' },
      { name: 'Features', path: '/features' },
      { name: 'Institutions', path: '/institutions' },
      { name: 'Transactions', path: '/transactions' },
    ];

    const features: Feature[] = baseFeatures.map((feature) => ({
      id: uuidv4(),
      ...feature,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('features', features);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('features', {});
  },
};
