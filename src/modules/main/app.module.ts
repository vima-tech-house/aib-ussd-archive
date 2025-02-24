import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from 'database/database.module';
import { ConfigService } from 'config/config.service';
import { ConfigModule } from 'config/config.module';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // redis: configService.redisConfig,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DatabaseModule,
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
