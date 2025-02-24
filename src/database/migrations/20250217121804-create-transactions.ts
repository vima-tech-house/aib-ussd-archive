import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('transactions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      source_account_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'accounts', key: 'id' },
      },
      date_of_payment: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('income', 'refund'),
        defaultValue: 'income',
        allowNull: false,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'quotations', key: 'id' },
      },
      insurer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'insurers', key: 'id' },
      },
      reference_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM('e-payment', 'bank deposit', 'insurer-code'),
        allowNull: false,
      },
      payment_provider: {
        type: DataTypes.ENUM('Flutterwave', 'MTN', 'Airtel'),
        allowNull: false,
      },
      proof_of_payment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('transactions');
  },
};