'use strict';

import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE enum_accounts_account_type ADD VALUE IF NOT EXISTS 'individual';",
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE accounts ALTER COLUMN account_type DROP DEFAULT;`,
    );

    await queryInterface.sequelize.query(
      `UPDATE accounts SET account_type = 'private' WHERE account_type = 'individual';`,
    );

    await queryInterface.sequelize.query(
      `DO $$ 
       BEGIN 
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_accounts_account_type_new') THEN 
             CREATE TYPE enum_accounts_account_type_new AS ENUM ('private', 'government'); 
         END IF; 
       END $$;`,
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE accounts ALTER COLUMN account_type TYPE enum_accounts_account_type_new USING account_type::text::enum_accounts_account_type_new;`,
    );

    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_accounts_account_type;`,
    );

    await queryInterface.sequelize.query(
      `ALTER TYPE enum_accounts_account_type_new RENAME TO enum_accounts_account_type;`,
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE accounts ALTER COLUMN account_type SET DEFAULT 'private';`,
    );
  },
};
