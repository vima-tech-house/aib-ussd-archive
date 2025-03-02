import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
} from 'sequelize-typescript';
import { UssdState } from '@/interfaces/ussd-states.enum';

@Table({ tableName: 'ussd_sessions', underscored: true })
export class UssdSession extends Model<UssdSession> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  session_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UssdState)),
    allowNull: false,
    defaultValue: UssdState.INITIAL,
  })
  state!: UssdState;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
  })
  data!: Record<string, any>;

  @CreatedAt
  @Column(DataType.DATE)
  created_at!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at!: Date;
}
