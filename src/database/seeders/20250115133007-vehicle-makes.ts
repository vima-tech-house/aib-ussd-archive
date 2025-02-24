import { Seeder } from 'interfaces/seeder.interface';
import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const seeder: Seeder = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const makes = [
      'Acura',
      'Alfa Romeo',
      'Aston Martin',
      'Audi',
      'Bentley',
      'BMW',
      'Bugatti',
      'Buick',
      'Cadillac',
      'Chevrolet',
      'Chrysler',
      'Citroën',
      'Dacia',
      'Daewoo',
      'Daihatsu',
      'Dodge',
      'Ferrari',
      'Fiat',
      'Ford',
      'Genesis',
      'GMC',
      'Honda',
      'Hyundai',
      'Infiniti',
      'Isuzu',
      'Jaguar',
      'Jeep',
      'Kia',
      'Lamborghini',
      'Lancia',
      'Land Rover',
      'Lexus',
      'Lincoln',
      'Lotus',
      'Maserati',
      'Maybach',
      'Mazda',
      'McLaren',
      'Mercedes-Benz',
      'Mini',
      'Mitsubishi',
      'Nissan',
      'Opel',
      'Peugeot',
      'Polestar',
      'Porsche',
      'Ram',
      'Renault',
      'Rolls-Royce',
      'Saab',
      'Seat',
      'Škoda',
      'Smart',
      'SsangYong',
      'Subaru',
      'Suzuki',
      'Tesla',
      'Toyota',
      'Volkswagen',
      'Volvo',
    ].map((name) => ({
      id: uuidv4(),
      name,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('vehicle_makes', makes, {});
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('vehicle_makes', {}, {});
  },
};

export default seeder;
