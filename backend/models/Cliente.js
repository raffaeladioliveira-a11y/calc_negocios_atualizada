const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    empresa: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Ativo', 'Inativo'),
        defaultValue: 'Ativo'
    },
    calculations: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    avatar: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    last_activity: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // CAMPO NOVO - Valor por hora para calculadora
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 150.00,
        comment: 'Valor por hora do cliente para orçamentos'
    }
}, {
    tableName: 'clientes',
    indexes: [
        {
            fields: ['email']
        },
        {
            fields: ['empresa']
        },
        {
            fields: ['status']
        },
        {
            fields: ['valor'] // Novo índice para consultas por valor
        }
    ]
});

// Hook para gerar avatar automaticamente se não fornecido
Cliente.beforeCreate((cliente) => {
    if (!cliente.avatar && cliente.name) {
    const names = cliente.name.trim().split(' ');
    cliente.avatar = names.length >= 2
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
}
});

Cliente.beforeUpdate((cliente) => {
    if (!cliente.avatar && cliente.name) {
    const names = cliente.name.trim().split(' ');
    cliente.avatar = names.length >= 2
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
}
});

module.exports = Cliente;