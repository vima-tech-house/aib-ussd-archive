require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

module.exports = {
  development: {
    dialect: 'postgres',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME || 'database_development',
    host: process.env.DATABASE_HOST || '127.0.0.1',
  },
  test: {
    dialect: 'postgres',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME || 'database_test',
    host: process.env.DATABASE_HOST || '127.0.0.1',
  },
  production: {
    dialect: 'postgres',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || null,
    database: process.env.DATABASE_NAME || 'database_production',
    host: process.env.DATABASE_HOST || '127.0.0.1',
  },
};
