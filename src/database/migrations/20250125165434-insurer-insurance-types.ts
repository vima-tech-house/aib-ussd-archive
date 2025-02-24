import { QueryInterface } from 'sequelize';

interface InsuranceType {
  id: string;
  name: string;
}

interface Insurer {
  id: string;
  name: string;
}

module.exports = {
  async up(queryInterface: QueryInterface) {
    const insuranceTypes = (await queryInterface.sequelize.query(
      `SELECT id, name FROM insurance_types;`,
    )) as [InsuranceType[], unknown];

    const insuranceTypeMap = insuranceTypes[0].reduce<Record<string, string>>(
      (acc, type) => {
        acc[type.name.toLowerCase()] = type.id;
        return acc;
      },
      {},
    );

    console.log('Insurance Type Map:', insuranceTypeMap);

    const insurers = (await queryInterface.sequelize.query(
      `SELECT id, name FROM insurers;`,
    )) as [Insurer[], unknown];

    const insurerRecords = insurers[0].map((insurer) => ({
      id: insurer.id,
      name: insurer.name,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    if (insurerRecords.length > 0) {
      await queryInterface.bulkInsert('insurers', insurerRecords, {});
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('insurer_insurance_types', {}, {});
    await queryInterface.bulkDelete('insurers', {}, {});
  },
};
