import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { QuotationItem } from './quotation-item.model';
import { Account } from './account.model';
import { User } from './user.model';
import { Insurer } from './insurer.model';
import { Transactions } from './transaction.model';

@Table({ tableName: 'policies' })
export class Policy extends Model<Policy> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  contract!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  certificate!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount!: number;

  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'ongoing', 'expired'))
  status!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  start_date!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  end_date!: Date;

  @ForeignKey(() => QuotationItem)
  @AllowNull(false)
  @Column(DataType.UUID)
  quotation_item_id!: string;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Column(DataType.UUID)
  account_id!: string;

  @ForeignKey(() => Insurer)
  @AllowNull(false)
  @Column(DataType.UUID)
  insurer_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  created_by!: string;

  @ForeignKey(() => Transactions)
  @AllowNull(false)
  @Column(DataType.UUID)
  transaction_id!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsTo(() => QuotationItem)
  quotationItem!: QuotationItem;

  @BelongsTo(() => Account)
  account!: Account;

  @BelongsTo(() => Insurer)
  insurer!: Insurer;

  @BelongsTo(() => User)
  creator!: User;

  @BelongsTo(() => Transactions)
  transaction!: Transactions;
}
