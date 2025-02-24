import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(
      "DO $$ BEGIN CREATE TYPE enum_institutions_account_type AS ENUM ('private', 'government'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;",
    );

    await queryInterface.createTable('institutions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      account_type: {
        type: 'enum_institutions_account_type',
        defaultValue: 'private',
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Date.now(),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Date.now(),
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('institutions');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_institutions_account_type;',
    );
  },
};
