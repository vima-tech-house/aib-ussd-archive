import { ConfigInterface } from '@/interfaces/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  DATABASE_TYPE: Joi.string().valid('postgres').required(),
  PORT: Joi.number().default(3000),
  BASE_API_PORT: Joi.string().default('3000'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_PREFIX: Joi.string().default('bull'),
  // GOOGLEAUTH_CLIENT_ID: Joi.string().optional(),
  // GOOGLEAUTH_CLIENT_SECRET: Joi.string().optional(),
  // GOOGLEAUTH_REDIRECT_URI: Joi.string().optional(),
});

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<ConfigInterface>) {}

  get port() {
    return String(
      this.configService.get('PORT') ||
        this.configService.get('BASE_API_PORT') ||
        8080,
    );
  }

  get redisConfig() {
    return {
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
      db: this.redisDb,
      prefix: this.redisPrefix,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 1000, 2000);
        if (times > 5) {
          return null;
        }
        return delay;
      },
    };
  }

  get isDev(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }

  get isProd(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.configService.get('NODE_ENV') === 'test';
  }

  get databaseType() {
    return this.configService.get('DATABASE_TYPE');
  }

  get databaseHost() {
    return this.configService.get('DATABASE_HOST');
  }

  get databasePort() {
    return this.configService.get('DATABASE_PORT');
  }

  get databaseUsername() {
    return this.configService.get('DATABASE_USERNAME');
  }

  get databasePassword() {
    return this.configService.get('DATABASE_PASSWORD');
  }

  get databaseName() {
    return this.configService.get('DATABASE_NAME');
  }

  get jwtSecret() {
    return this.configService.get('JWT_SECRET');
  }

  get redisHost() {
    return this.configService.get('REDIS_HOST');
  }

  get redisPort() {
    return this.configService.get('REDIS_PORT');
  }

  get redisPassword() {
    return this.configService.get('REDIS_PASSWORD');
  }

  get redisDb() {
    return this.configService.get('REDIS_DB');
  }

  get redisPrefix() {
    return this.configService.get('REDIS_PREFIX');
  }

  // get googleauthClientId() {
  //   return this.configService.get('GOOGLEAUTH_CLIENT_ID');
  // }

  // get googleauthClientSecret() {
  //   return this.configService.get('GOOGLEAUTH_CLIENT_SECRET');
  // }

  // get googleauthRedirectUri() {
  //   return this.configService.get('GOOGLEAUTH_REDIRECT_URI');
  // }

  get(key: string) {
    return this.configService.get(key as any);
  }
}
