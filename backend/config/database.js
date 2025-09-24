const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'meu_projeto_db',
    username: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password_123',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        charset: 'utf8mb4'
        // Removi o collate que estava causando erro
    },
    define: {
        charset: 'utf8mb4',
        timestamps: true,
        underscored: false,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Testar conexão com mais detalhes
const testConnection = async () => {
    try {
        console.log('🔄 Tentando conectar ao MySQL...');
        console.log('📋 Configurações:', {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'meu_projeto_db',
            username: process.env.DB_USER || 'app_user',
        });

        await sequelize.authenticate();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');

        // Testar se consegue listar tabelas
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('📊 Tabelas disponíveis:', results.length);

    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:');
        console.error('   Mensagem:', error.message);
        console.error('   Código:', error.code);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔐 Erro de autenticação - verifique usuário/senha');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Conexão recusada - MySQL pode não estar rodando');
        }

        // Não sair do processo, apenas logar o erro
        console.error('⚠️  Continuando sem conexão com banco...');
    }
};

module.exports = { sequelize, testConnection };