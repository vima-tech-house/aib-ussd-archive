import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.changeColumn('vehicles', 'engineNumber', {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
      validate: {
        len: [6, 15],
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.changeColumn('vehicles', 'engineNumber', {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        len: [6, 15],
      },
    });
  },
};
