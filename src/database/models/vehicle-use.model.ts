import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { Vehicle } from './vehicle.model';
import { Quotation } from './quotation.model';

export enum VehicleUsageType {
  PRIVATE = 'Private',
  COMMERCIAL = 'Commercial',
  TAXI = 'Taxi',
  FOR_HIRE = 'For Hire',
}

@Table({ tableName: 'vehicle_uses' })
export class VehicleUse extends Model<VehicleUse> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.ENUM(...Object.values(VehicleUsageType)),
    allowNull: false,
    comment: 'Specifies how the vehicle is used',
  })
  usage_type!: VehicleUsageType;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @HasMany(() => Quotation)
  quotations!: Quotation[];
}
