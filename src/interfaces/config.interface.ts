export interface ConfigInterface {
  NODE_ENV: string;
  PORT: number;
  DATABASE_TYPE: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  BASE_API_PORT: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD: string;
  REDIS_DB: string;
  REDIS_PREFIX: string;
}
