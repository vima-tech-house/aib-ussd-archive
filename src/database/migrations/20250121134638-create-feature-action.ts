import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('feature_actions', {
      action_id: {
        allowNull: false,
        type: DataTypes.UUID,
        references: {
          model: 'actions',
          key: 'id',
        },
      },
      feature_id: {
        allowNull: false,
        type: DataTypes.UUID,
        references: {
          model: 'features',
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('feature_actions');
  },
};
