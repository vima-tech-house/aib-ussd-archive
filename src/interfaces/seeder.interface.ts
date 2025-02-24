import type { QueryInterface } from 'sequelize';

export interface Seeder {
  up: (queryInterface: QueryInterface, Sequelize: any) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: any) => Promise<void>;
}
