import { QueryInterface, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';

interface Feature {
  id: string;
}

interface Action {
  id: string;
}

export default {
  async up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
    const features: Feature[] = await queryInterface.sequelize.query('SELECT id FROM features', {
      type: QueryTypes.SELECT,
    });

    const actions: Action[] = await queryInterface.sequelize.query('SELECT id FROM actions', {
      type: QueryTypes.SELECT,
    });

    const featureActionData = features.flatMap(feature =>
      actions.map(action => ({
        feature_id: feature.id,
        action_id: action.id,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    await queryInterface.bulkInsert('feature_actions', featureActionData);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('feature_actions', {});
  },
};
