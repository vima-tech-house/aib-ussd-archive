import { Module } from '@nestjs/common';
import * as path from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
          // Account,
          // Notification,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
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
