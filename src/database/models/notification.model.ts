import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { Feature } from '@/common/enums/feature.enum';

@Table({ tableName: 'notifications', underscored: true })
export class Notification extends Model {
  @Column({
    type: DataType.ENUM(...Object.values(Feature)),
    allowNull: false,
  })
  feature!: Feature;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  recipients!: string[];

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  timestamp!: Date;
}
