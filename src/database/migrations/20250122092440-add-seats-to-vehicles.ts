import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('vehicles', 'seats', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 100,
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('vehicles', 'seats');
  },
};
