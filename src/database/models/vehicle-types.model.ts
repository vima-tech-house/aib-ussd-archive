import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { VehicleMake } from './vehicle-make.model';
import { Vehicle } from './vehicle.model';

@Table({
  tableName: 'vehicle_types',
  timestamps: true,
})
export class VehicleType extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => VehicleMake)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  makeId!: string;

  @BelongsTo(() => VehicleMake)
  make!: VehicleMake;

  @HasMany(() => Vehicle)
  vehicles!: Vehicle[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'name',
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.STRING,
  })
  description!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive!: boolean;
}
