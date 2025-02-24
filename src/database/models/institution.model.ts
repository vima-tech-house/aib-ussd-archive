import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  Unique,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Account } from './account.model';
import { AccountType } from '@/common/enums';

@Table({ tableName: 'institutions', underscored: true })
export class Institution extends Model<Institution> {
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
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  phone_number!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.INTEGER)
  tin!: string;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(AccountType)),
    defaultValue: AccountType.PRIVATE,
  })
  account_type!: AccountType;

  @AllowNull(false)
  @Column(DataType.STRING)
  address!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @HasMany(() => User)
  users!: User[];

  @HasOne(() => Account)
  account!: Account;
}
