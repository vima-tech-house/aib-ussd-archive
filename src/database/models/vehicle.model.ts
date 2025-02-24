import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
  BeforeUpdate,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { VehicleMake } from './vehicle-make.model';
import { VehicleType } from './vehicle-types.model';
import { BaseModel } from './base.model';
// import { Quotation } from '../quotations/models/quotation.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus, VehicleEngineType } from 'common/enums/vehicle.enum';
import { User } from '@database/models/user.model';
import { Account } from '@database/models/account.model';
import { AccountStatus } from '@/common/enums';

@Table({
  tableName: 'vehicles',
  timestamps: true,
  paranoid: true,
  comment: 'Stores information about vehicles registered in the system',
})
export class Vehicle extends BaseModel {
  @ApiProperty({
    description: 'The ID of the user who owns this vehicle',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    comment: 'Reference to the user who owns this vehicle',
  })
  userId!: string;

  @ApiProperty({
    description: 'The ID of the vehicle make',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ForeignKey(() => VehicleMake)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    comment: 'Reference to the vehicle make (manufacturer)',
  })
  makeId!: string;

  @ApiProperty({
    description: 'The ID of the vehicle type',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ForeignKey(() => VehicleType)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    comment: 'Reference to the vehicle type (e.g., SUV, Sedan)',
  })
  vehicleTypeId!: string;

  @ApiProperty({
    description: 'The vehicle plate number',
    example: 'RAA123A',
  })
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(10),
    comment: 'Vehicle registration plate number',
    validate: {
      is: /^[A-Za-z0-9]{3,10}$/i,
      len: [3, 10],
    },
  })
  plateNumber!: string;

  @ApiProperty({
    description: 'The vehicle model',
    example: 'Camry',
  })
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
    comment: 'Vehicle model name',
    validate: {
      len: [1, 50],
    },
  })
  model!: string;

  @ApiProperty({
    description: 'The vehicle status',
    example: AccountStatus.ACTIVE,
    enum: VehicleStatus,
  })
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(VehicleStatus)),
    defaultValue: VehicleStatus.ACTIVE,
    comment: 'Vehicle status (active/inactive/pending)',
  })
  status!: VehicleStatus;

  @ApiProperty({
    description: 'The vehicle manufacturing year',
    example: 2023,
  })
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Vehicle manufacturing year',
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
  })
  year!: number;

  @ApiProperty({
    description: 'The vehicle chassis number',
    example: 'JT2AE09W3P0030832',
  })
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(17),
    comment: 'Vehicle identification number (VIN) or chassis number',
    validate: {
      // is: /^[A-HJ-NPR-Z0-9]+$/i,
      len: [11, 17],
    },
  })
  chassisNumber!: string;

  @ApiPropertyOptional({
    description: 'The vehicle engine number',
    example: '2AZ4000032',
  })
  @Unique
  @AllowNull(true)
  @Column({
    type: DataType.STRING(15),
    comment: 'Vehicle engine number',
    validate: {
      len: [6, 15],
    },
  })
  engineNumber?: string;

  @ApiProperty({
    description: 'The vehicle engine type',
    example: VehicleEngineType.PETROL,
    enum: VehicleEngineType,
  })
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(VehicleEngineType)),
    comment: 'Vehicle engine type',
  })
  engineType?: VehicleEngineType;

  @ApiProperty({
    description: 'The vehicle seating capacity',
    example: 5,
  })
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Vehicle seating capacity',
    validate: {
      min: 1,
      max: 100,
    },
  })
  seats!: number;

  @ApiProperty({
    description: 'The vehicle value in RWF',
    example: 5,
  })
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Vehicle value in RWF',
  })
  value!: number;

  @ApiPropertyOptional({
    description: 'The vehicle identification card URLs',
    example: ['https://example.com/vehicle-id-card.jpg'],
  })
  @AllowNull(true)
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    comment: 'Vehicle identification card URLs',
  })
  vehicleIdentificationCardUrls?: string[];

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => VehicleMake)
  make!: VehicleMake;

  @BelongsTo(() => VehicleType)
  vehicleType!: VehicleType;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.UUID,
    field: 'account_id',
  })
  accountId!: string;

  @BelongsTo(() => Account)
  account!: Account;

  //   @HasMany(() => Quotation)
  //   quotations!: Quotation[];

  @BeforeCreate
  @BeforeUpdate
  static async validateVehicle(instance: Vehicle) {
    if (instance.plateNumber) {
      instance.plateNumber = instance.plateNumber.toUpperCase();
    }

    if (instance.chassisNumber) {
      instance.chassisNumber = instance.chassisNumber.toUpperCase();
    }

    if (instance.engineNumber) {
      instance.engineNumber = instance.engineNumber.toUpperCase();
    }
  }

  async getFullDetails() {
    return {
      id: this.id,
      plateNumber: this.plateNumber,
      make: await this.make,
      model: this.model,
      year: this.year,
      type: await this.vehicleType,
      chassisNumber: this.chassisNumber,
      engineNumber: this.engineNumber,
      seats: this.seats,
      owner: await this.user,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
