import { Module } from '@nestjs/common';
import * as path from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Institution } from './models/institution.model';
import { Feature } from './models/feature.model';
import { Action } from './models/action.model';
import { InsuranceType } from './models/insurance-type.model';
import { FeatureAction } from './models/feature-action.model';
import { UserFeatureAction } from './models/user-feature-action.model';
import { Account } from './models/account.model';
import { Vehicle } from './models/vehicle.model';
import { VehicleMake } from './models/vehicle-make.model';
import { VehicleType } from './models/vehicle-types.model';
import { Insurer } from './models/insurer.model';
import { InsurerInsuranceType } from './models/insurer-insurance-type.model';
import { VehicleUse } from './models/vehicle-use.model';
import { Quotation } from './models/quotation.model';
import { QuotationItem } from './models/quotation-item.model';
import { Transactions } from './models/transaction.model';
import { Policy } from './models/policy.model';
import { Notification } from './models/notification.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(
          configService.get<string>('DATABASE_PORT') || '5432',
          10,
        ),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        models: [
          User,
          Institution,
          InsuranceType,
          Feature,
          Action,
          FeatureAction,
          UserFeatureAction,
          Account,
          Vehicle,
          VehicleMake,
          VehicleType,
          Insurer,
          InsurerInsuranceType,
          VehicleUse,
          Quotation,
          QuotationItem,
          Transactions,
          Policy,
          Notification,
        ],
        synchronize:  configService.get('NODE_ENV') === 'development',
        autoLoadModels: true,
        migrationStorage: 'sequelize',
        migrationStorageTableName: 'SequelizeMeta',
        migrationStoragePath: path.join(__dirname, '../migrations/meta.json'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
