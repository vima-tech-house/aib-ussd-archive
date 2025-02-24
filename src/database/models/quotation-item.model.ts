import { Insurer } from './insurer.model';
import { Quotation } from './quotation.model';
import { Vehicle } from './vehicle.model';
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
  ForeignKey,
  Default,
  BelongsTo,
} from 'sequelize-typescript';

@Table({ tableName: 'quotation_items' })
export class QuotationItem extends Model<QuotationItem> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vehicle_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  policyQuoteNumber!: string;

  @ForeignKey(() => Quotation)
  @AllowNull(false)
  @Column(DataType.UUID)
  quotation_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  startDate!: string; // Start date for this quotation item

  @AllowNull(false)
  @Column(DataType.STRING)
  endDate!: string; // End date for this quotation item

  @AllowNull(false)
  @Column(DataType.STRING)
  periodPattern!: string; // Insurance pattern choice like 1-15, 1, 2, 3, 6, 9, 12

  @AllowNull(false)
  @Column(DataType.STRING)
  insuranceClass!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.INTEGER)
  nbrOfOccupantsCovered!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  sumInsuredPerOccupant!: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  deductible!: boolean;

  @AllowNull(false)
  @Default('RWANDA')
  @Column(DataType.STRING)
  territorialLimit!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  periodOfInsurance!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  totalPremium!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @BelongsTo(() => Quotation)
  quotation!: Quotation;

  @BelongsTo(() => Vehicle)
  vehicle!: Vehicle;
}
