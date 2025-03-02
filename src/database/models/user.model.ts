import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasOne,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { Institution } from './institution.model';
import { UserFeatureAction } from './user-feature-action.model';
import { Feature } from './feature.model';
import { Action } from './action.model';
import { Account } from './account.model';
import { Quotation } from './quotation.model';

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'user_id',
  })
  user_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  first_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  last_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  phone_number!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_verified!: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  is_client!: boolean;

  @AllowNull(false)
  @Default('individual')
  @Column(DataType.STRING)
  client_type!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @ForeignKey(() => Institution)
  @AllowNull(true)
  @Column(DataType.UUID)
  institution_id!: string;

  @BelongsTo(() => Institution)
  institution!: Institution;

  @BelongsToMany(() => Feature, () => UserFeatureAction)
  features!: Feature[];

  @BelongsToMany(() => Action, () => UserFeatureAction)
  actions!: Action[];

  @HasOne(() => Account, {
    foreignKey: 'userId',
    sourceKey: 'user_id',
  })
  account!: Account;

  @HasMany(() => Quotation)
  quotations!: Quotation[];
}
