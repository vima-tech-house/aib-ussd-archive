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
  HasMany,
} from 'sequelize-typescript';
import { InsuranceType } from './insurance-type.model';
import { InsurerInsuranceType } from './insurer-insurance-type.model';
import { Quotation } from './quotation.model';

@Table({ tableName: 'insurers' })
export class Insurer extends Model<Insurer> {
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'avatar_url',
  })
  avatar_url!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'phone_number',
  })
  phone_number!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'contact_person',
  })
  contact_person!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  is_active!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  favorite!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  display!: string;

  @BelongsToMany(() => InsuranceType, () => InsurerInsuranceType)
  insuranceTypes!: InsuranceType[];

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @HasMany(() => Quotation)
  quotations!: Quotation[];
}
