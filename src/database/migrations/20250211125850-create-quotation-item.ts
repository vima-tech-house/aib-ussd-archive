import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('quotation_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id',
        },
      },
      policyQuoteNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'quotations',
          key: 'id',
        },
      },
      startDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      periodPattern: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      insuranceClass: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nbrOfOccupantsCovered: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sumInsuredPerOccupant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deductible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      territorialLimit: {
        type: DataTypes.ENUM('RWANDA', 'COMESA', 'EAC', 'WORLDWIDE'),
        allowNull: false,
      },
      periodOfInsurance: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalPremium: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('quotation_items');
  },
};
