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
  HasMany,
  BeforeCreate,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Institution } from './institution.model';
import { AccountStatus, AccountType } from '@/common/enums';
import { Vehicle } from './vehicle.model';
import { Quotation } from './quotation.model';

@Table({ tableName: 'accounts', underscored: true })
export class Account extends Model<Account> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Institution)
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'institution_id',
  })
  institutionId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(AccountStatus)),
    defaultValue: AccountStatus.ACTIVE,
  })
  status!: AccountStatus;

  @Column({
    type: DataType.ENUM(...Object.values(AccountType)),
    defaultValue: AccountType.PRIVATE,
    field: 'account_type',
  })
  account_type!: AccountType;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt!: Date;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    targetKey: 'user_id',
  })
  user!: User;

  @BelongsTo(() => Institution, {
    foreignKey: 'institution_id',
    targetKey: 'id',
    constraints: false,
  })
  institution!: Institution;

  @HasMany(() => Vehicle)
  vehicles!: Vehicle[];

  @HasMany(() => Quotation)
  quotations!: Quotation[];

  @BeforeCreate
  static async setDefaultAccountType(instance: Account) {
    if (!instance.account_type) {
      instance.account_type = instance.userId
        ? AccountType.PRIVATE
        : instance.institutionId
          ? AccountType.GOVERNMENT
          : AccountType.PRIVATE;
    }
  }
}
