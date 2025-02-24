import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UserModule } from '@modules/users/user.module';
import { InstitutionModule } from '@modules/institutions/institution.module';
import { DatabaseModule } from 'database/database.module';
import { VehiclesModule } from 'modules/vehicles/vehicles.module';
import { InsuranceTypeModule } from '@modules/insurance-types/insurance-type.module';
import { ConfigService } from 'config/config.service';
import { ConfigModule } from 'config/config.module';
import { AuthModule } from 'modules/auth/auth.module';
import { SocketModule } from '@modules/socket/socket.module';
import { InsurersModule } from '@modules/insurers/insurers.module';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { FeatureModule } from '@modules/features/feature.module';
import { QuotationsModule } from '@modules/quotations/quotations.module';
import { TransactionModule } from '@modules/transactions/transaction.module';
import { PolicyModule } from '@modules/policies/policy.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    NotificationModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // redis: configService.redisConfig,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DatabaseModule,
    UserModule,
    VehiclesModule,
    InstitutionModule,
    InsuranceTypeModule,
    SocketModule,
    FeatureModule,
    InsurersModule,
    AccountsModule,
    QuotationsModule,
    TransactionModule,
    PolicyModule,
  ],
})
export class AppModule {
  static port: string | number;
  static isDev: boolean;

  constructor(private readonly config: ConfigService) {
    AppModule.port = this.config.port;
    AppModule.isDev = this.config.isDev;
  }
}
