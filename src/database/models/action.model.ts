import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AllowNull, Unique, BelongsToMany } from 'sequelize-typescript';
import { Feature } from './feature.model';
import { FeatureAction } from './feature-action.model';
import { User } from './user.model';
import { UserFeatureAction } from './user-feature-action.model';

@Table({ tableName: 'actions' })
export class Action extends Model<Action> {
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

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsToMany(() => Feature, () => FeatureAction)
  features!: Feature[];

  @BelongsToMany(() => User, () => UserFeatureAction)
  users!: User[];
}
