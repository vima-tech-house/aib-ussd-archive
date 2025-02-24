'use strict';

import { AccountStatus } from '@/common/enums';
import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize
      .query("CREATE TYPE enum_accounts_status AS ENUM ('active', 'inactive');")
      .catch((error) => {
        if (error.original.code !== '42710') throw error;
      });

    await queryInterface.sequelize
      .query(
        "CREATE TYPE enum_accounts_account_type AS ENUM ('private', 'government');",
      )
      .catch((error) => {
        if (error.original.code !== '42710') throw error;
      });

    await queryInterface.createTable('accounts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      institution_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'institutions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: AccountStatus.ACTIVE,
        allowNull: false,
      },
      account_type: {
        type: DataTypes.ENUM('private', 'government'),
        defaultValue: 'private',
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await Promise.all([
      queryInterface.addIndex('accounts', ['user_id']),
      queryInterface.addIndex('accounts', ['institution_id']),
      queryInterface.addIndex('accounts', ['status']),
      queryInterface.addIndex('accounts', ['account_type']),
    ]);

    await queryInterface
      .removeConstraint('accounts', 'accounts_user_id_fkey')
      .catch((error) =>
        console.log('Constraint may not exist:', error.message),
      );

    await queryInterface
      .removeConstraint('accounts', 'accounts_institution_id_fkey')
      .catch((error) =>
        console.log('Constraint may not exist:', error.message),
      );

    await queryInterface.addConstraint('accounts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'accounts_user_id_fkey',
      references: {
        table: 'users',
        field: 'user_id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('accounts', {
      fields: ['institution_id'],
      type: 'foreign key',
      name: 'accounts_institution_id_fkey',
      references: {
        table: 'institutions',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('vehicles', 'account_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('vehicles', ['account_id']);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeIndex('vehicles', ['account_id']);
    await queryInterface.removeColumn('vehicles', 'account_id');

    await Promise.all([
      queryInterface.removeIndex('accounts', ['user_id']),
      queryInterface.removeIndex('accounts', ['institution_id']),
      queryInterface.removeIndex('accounts', ['status']),
      queryInterface.removeIndex('accounts', ['account_type']),
    ]);

    await queryInterface.removeConstraint('accounts', 'accounts_user_id_fkey');
    await queryInterface.removeConstraint(
      'accounts',
      'accounts_institution_id_fkey',
    );

    await queryInterface.dropTable('accounts');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_accounts_status;',
    );
    return queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_accounts_account_type;',
    );
  },
};
