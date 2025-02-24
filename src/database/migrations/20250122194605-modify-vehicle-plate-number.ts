'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    return Promise.all([
      await queryInterface.changeColumn('vehicles', 'plateNumber', {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[A-Za-z0-9]{3,10}$/i,
          len: [3, 10],
        },
      }),

      await queryInterface.sequelize.query(`
        COMMENT ON COLUMN vehicles."plateNumber" IS 'Vehicle registration plate number (3-10 alphanumeric characters)';
      `),
    ]);
  },

  async down(queryInterface: QueryInterface) {
    return Promise.all([
      await queryInterface.changeColumn('vehicles', 'plateNumber', {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
          is: /^[A-Z0-9]+$/i,
          len: [5, 10],
        },
      }),

      // Revert the comment
      await queryInterface.sequelize.query(`
        COMMENT ON COLUMN vehicles."plateNumber" IS 'Vehicle registration plate number';
      `),
    ]);
  },
};
