require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: process.env.DB_LOGGING === 'true',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'math_app_test',
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
};