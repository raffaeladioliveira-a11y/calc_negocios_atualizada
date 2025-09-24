const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CalcValores = sequelize.define('CalcValores', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Valores por hora dos profissionais
    valor_hora_cp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 150.00
    },
    valor_hora_dg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 100.00
    },
    valor_hora_lp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 180.00
    },
    valor_hora_pfb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 120.00
    },
    valor_hora_at: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 110.00
    },
    valor_hora_an: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 130.00
    },
    valor_hora_gp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 160.00
    },

    // Valor contingência
    contingencia_valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 120.00
    },

    // Valores dos pacotes
    valor_pacote_pp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 11000.00
    },
    valor_pacote_p: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 20000.00
    },
    valor_pacote_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 38000.00
    },
    valor_pacote_g: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 54000.00
    },
    valor_pacote_gg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 68000.00
    },

    // Auditoria
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'calc_valores',
    timestamps: true, // Cria created_at e updated_at automaticamente
    underscored: true // Usa snake_case nos nomes das colunas
});

module.exports = CalcValores;
