/**
 * Created by rafaela on 25/09/25.
 */
// backend/config/config.js
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'app_user',
        password: process.env.DB_PASSWORD || 'app_password_123',
        database: process.env.DB_NAME || 'meu_projeto_db',
        host: process.env.DB_HOST || '127.0.0.1', //trocar aqui para "mysql" ou "mysql_db" para funcionar as migrations e seeders.
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        timezone: '+00:00',
        logging: false
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        timezone: '+00:00',
        logging: false
    }
};
