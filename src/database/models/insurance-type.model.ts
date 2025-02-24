import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { Insurer } from './insurer.model';
import { InsurerInsuranceType } from './insurer-insurance-type.model';

@Table({ tableName: 'insurance_types' })
export class InsuranceType extends Model<InsuranceType> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  description!: string;

  @BelongsToMany(() => Insurer, () => InsurerInsuranceType)
  insurers!: Insurer[];

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;
}