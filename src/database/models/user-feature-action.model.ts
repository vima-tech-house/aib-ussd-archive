import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  PrimaryKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Feature } from './feature.model';
import { Action } from './action.model';
import { User } from './user.model';

@Table({ tableName: 'user_feature_actions' })
export class UserFeatureAction extends Model<UserFeatureAction> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

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

  @BelongsTo(() => User)
  user!: User;
  
  @BelongsTo(() => Feature)
  feature!: Feature;
  
  @BelongsTo(() => Action)
  action!: Action;
}
