import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface Action {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const baseActions = [
      { name: 'create' },
      { name: 'read' },
      { name: 'update' },
      { name: 'delete' },
    ];

    const actions: Action[] = baseActions.map((action) => ({
      id: uuidv4(),
      ...action,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('actions', actions);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('actions', {});
  },
};
