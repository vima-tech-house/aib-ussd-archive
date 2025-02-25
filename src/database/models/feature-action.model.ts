import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import { Feature } from './feature.model';
import { Action } from './action.model';

@Table({ tableName: 'feature_actions' })
export class FeatureAction extends Model<FeatureAction> {
  @PrimaryKey
  @ForeignKey(() => Feature)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  feature_id!: string;

  @PrimaryKey
  @ForeignKey(() => Action)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  action_id!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;
}
