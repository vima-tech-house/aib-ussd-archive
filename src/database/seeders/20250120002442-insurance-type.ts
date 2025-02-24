import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface InsuranceType {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const baseInsuranceTypes = [
      {
        name: 'FIRE',
        description: 'Fire insurance covers damage or loss to a property that is caused by fire.',
      },
      {
        name: 'MOTOR',
        description: 'Motor insurance covers the damage to vehicles and property caused by accidents.',
      },
      {
        name: 'LIFE',
        description:
          'Life insurance pays a sum of money to the beneficiaries of the insured person upon their death.',
      },
      {
        name: 'HEALTH',
        description:
          'Health insurance covers the costs of medical and surgical expenses of the insured.',
      },
      {
        name: 'TRAVEL',
        description:
          'Travel insurance covers the costs of medical and other emergencies while traveling.',
      },
    ];

    const insuranceTypes: InsuranceType[] = baseInsuranceTypes.map((type) => ({
      id: uuidv4(),
      ...type,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('insurance_types', insuranceTypes);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('insurance_types', {});
  },
};
