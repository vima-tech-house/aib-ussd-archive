import { Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Vehicle } from './vehicle.model';
import { VehicleType } from './vehicle-types.model';
import { BaseModel } from './base.model';

@Table({
  tableName: 'vehicle_makes',
  timestamps: true,
})
export class VehicleMake extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive!: boolean;

  @HasMany(() => Vehicle)
  vehicles!: Vehicle[];
}
