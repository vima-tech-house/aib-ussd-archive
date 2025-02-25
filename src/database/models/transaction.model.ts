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
  HasOne,
} from 'sequelize-typescript';
import { Account } from './account.model';
import { Policy } from './policy.model';
import { Insurer } from './insurer.model';
import { Quotation } from './quotation.model';

@Table({ tableName: 'transactions' })
export class Transactions extends Model<Transactions> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount!: number;

  @ForeignKey(() => Account)
  @AllowNull(true) // For external payments
  @Column(DataType.UUID)
  source_account_id!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  date_of_payment!: Date;

  @AllowNull(false)
  @Default('income')
  @Column(DataType.ENUM('income', 'refund'))
  type!: string;

  @ForeignKey(() => Quotation)
  @AllowNull(false)
  @Column(DataType.UUID)
  quotation_id!: string;

  @ForeignKey(() => Insurer)
  @AllowNull(false)
  @Column(DataType.UUID)
  insurer_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  reference_number!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('e-payment', 'bank deposit', 'insurer-code'))
  payment_method!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('Flutterwave', 'MTN', 'Airtel'))
  payment_provider!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  proof_of_payment!: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'successful', 'failed'))
  status!: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;

  @BelongsTo(() => Account)
  sourceAccount!: Account;

  @BelongsTo(() => Quotation)
  quotation!: Quotation;

  @BelongsTo(() => Insurer)
  insurer!: Insurer;

  @HasOne(() => Policy)
  policy!: Policy;
}
