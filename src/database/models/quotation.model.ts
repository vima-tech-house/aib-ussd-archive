import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  HasMany,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { QuotationItem } from './quotation-item.model';
import { Account } from './account.model';
import { User } from './user.model';
import { Insurer } from './insurer.model';

@Table({ tableName: 'quotations' })
export class Quotation extends Model<Quotation> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  quoteNumber!: string;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.STRING)
  status!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  effectiveStartDate!: string; // Start date of the quotation

  @AllowNull(true)
  @Column(DataType.STRING)
  effectiveEndDate!: string; // End date of the quotation

  @HasMany(() => QuotationItem)
  quotationItems!: QuotationItem[];

  @AllowNull(false)
  @Default(0)
  @Column(DataType.FLOAT)
  totalPremium!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  created_by!: string;

  @ForeignKey(() => Account)
  @AllowNull(false)
  @Column(DataType.UUID)
  account_id!: string;

  @ForeignKey(() => Insurer)
  @AllowNull(false)
  @Column(DataType.UUID)
  insurer_id!: string;

  updateTotalPremium() {
    this.totalPremium = this.quotationItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPremium),
      0,
    );
    this.save();
  }

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @BelongsTo(() => Account)
  account!: Account;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Insurer)
  insurer!: Insurer;
}
