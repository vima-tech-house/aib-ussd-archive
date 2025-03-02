import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AllowNull, Unique, BelongsToMany } from 'sequelize-typescript';
import { Action } from './action.model';
import { FeatureAction } from './feature-action.model';
import { UserFeatureAction } from './user-feature-action.model';
import { User } from './user.model';

@Table({ tableName: 'features' })
export class Feature extends Model<Feature> {
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
  path!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsToMany(() => Action, () => FeatureAction)
  actions!: Action[];

  @BelongsToMany(() => User, () => UserFeatureAction)
  users!: User[];
}
