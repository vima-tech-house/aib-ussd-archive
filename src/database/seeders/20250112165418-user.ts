import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        user_id: uuidv4(),
        first_name: 'John',
        last_name: 'Doe',
        email: ADMIN_EMAIL,
        role: 'super_admin',
        phone_number: '250700000000',
        client_type: 'individual',
        is_verified: true,
        password: await bcrypt.hash(
          `${ADMIN_PASSWORD}`,
          Number(process.env.SALT_ROUNDS),
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('users', {});
  },
};
