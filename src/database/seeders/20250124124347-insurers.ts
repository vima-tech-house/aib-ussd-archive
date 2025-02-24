import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface InsuranceType {
  id: string;
  name: string;
}

const insurers = [
  {
    display: 'Old Mutual Insurance',
    name: 'Old Mutual Insurance Rwanda',
    favorite: false,
    avatar_url: null,
    insuranceTypes: ['motor'],
  },
  {
    display: 'MUA',
    name: 'MUA Insurance Rwanda',
    favorite: false,
    avatar_url: 'mua_hj52ht.webp',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Britam',
    name: 'Britam Insurance Rwanda Limited',
    favorite: true,
    avatar_url: 'britam_ku5dyu.jpg',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Mayfair',
    name: 'Mayfair Insurance Company Rwanda Ltd',
    favorite: false,
    avatar_url: 'mayfair_danbjy.png',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Sonarwa General Insurance',
    name: 'Sonarwa General Insurance Company Ltd',
    favorite: false,
    avatar_url: 'sonarwanda_n4b4qh.jpg',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Sanlam Allianz General',
    name: 'Sanlam Vie Plc',
    favorite: false,
    avatar_url: 'sanlam_ozj6ix.jpg',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Radiant',
    name: 'Radiant Insurance Company',
    favorite: false,
    avatar_url: 'radiant_nie2vi.png',
    insuranceTypes: ['motor'],
  },
  {
    display: 'Prime Insurance',
    name: 'Prime Insurance',
    favorite: false,
    avatar_url: 'prime_cmf5zi.jpg',
    insuranceTypes: ['motor'],
  },
  {
    display: 'BK Insurance',
    name: 'BK Insurance',
    favorite: false,
    avatar_url: null,
    insuranceTypes: ['motor'],
  },
];

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

    const insurerRecords = insurers.map((insurer) => ({
      id: uuidv4(),
      name: insurer.name,
      display: insurer.display,
      email: null,
      avatar_url: insurer.avatar_url,
      phone_number: null,
      address: null,
      contact_person: null,
      favorite: insurer.favorite,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('insurers', insurerRecords, {});

    const insurerInsuranceTypeRecords = insurers.flatMap((insurer, index) =>
      insurer.insuranceTypes.map((type) => ({
        insurer_id: insurerRecords[index].id,
        insurance_type_id: insuranceTypeMap[type.toLowerCase()],
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );

    await queryInterface.bulkInsert(
      'insurer_insurance_types',
      insurerInsuranceTypeRecords,
      {},
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('insurer_insurance_types', {}, {});
    await queryInterface.bulkDelete('insurers', {}, {});
  },
};
