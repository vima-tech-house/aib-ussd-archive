import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Insurer } from './insurer.model';
import { InsuranceType } from './insurance-type.model';

@Table({ tableName: 'insurer_insurance_types' })
export class InsurerInsuranceType extends Model<InsurerInsuranceType> {
  @ForeignKey(() => Insurer)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  insurer_id!: string;

  @ForeignKey(() => InsuranceType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  insurance_type_id!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;
}
