import { VehicleEngineType } from '@/common/enums/vehicle.enum';
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('vehicles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      makeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicle_makes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vehicleTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicle_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vehicleIdentificationCardUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      plateNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      model: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chassisNumber: {
        type: DataTypes.STRING(17),
        allowNull: false,
        unique: true,
      },
      engineNumber: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      engineType: {
        type: DataTypes.ENUM(...Object.values(VehicleEngineType)),
        allowNull: false,
      },
      // seats: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('vehicles', ['plateNumber']);
    await queryInterface.addIndex('vehicles', ['chassisNumber']);
    await queryInterface.addIndex('vehicles', ['engineNumber']);
    await queryInterface.addIndex('vehicles', ['userId']);
    await queryInterface.addIndex('vehicles', ['makeId']);
    await queryInterface.addIndex('vehicles', ['vehicleTypeId']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('vehicles');
  },
};
