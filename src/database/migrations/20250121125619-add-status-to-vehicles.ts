'use strict';

import { AccountStatus } from '@/common/enums';
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('vehicles', 'status', {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: AccountStatus.ACTIVE,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('vehicles', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicles_status";',
    );
  },
};
