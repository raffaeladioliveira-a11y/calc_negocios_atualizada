/**
 * Created by rafaela on 24/09/25.
 */
// ==========================================
// 1. MODEL - backend/models/Orcamento.js
// ==========================================
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Orcamento = sequelize.define('Orcamento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Dados básicos do orçamento
    descricao: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 500]
        }
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clientes',
            key: 'id'
        }
    },
    contingencia: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: false,
        defaultValue: '1',
        comment: '1=Baixa(10%), 2=Média(20%), 3=Alta(30%)'
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Horas inseridas pelo usuário (input original)
    consultor_plataforma_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    designer_grafico_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    lead_programador_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    programador_front_back_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    analista_teste_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    analista_negocios_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },

    // Dias calculados
    consultor_plataforma_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    designer_grafico_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lead_programador_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    programador_front_back_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    analista_teste_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    analista_negocios_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    gerente_projeto_dias: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // Valores finais calculados
    consultor_plataforma_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    designer_grafico_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    lead_programador_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    programador_front_back_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    analista_teste_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    analista_negocios_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    gerente_projeto_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },

    // Totais e resumos
    gerente_projeto_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    previa_parcial_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    previa_parcial_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    contingencia_horas: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    contingencia_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total_horas_final: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    total_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },

    // Recomendações e análises
    pacote_recomendado: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    pacote_recomendado_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    orcado_vs_pacote_valor_final: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: 'Diferença entre valor orçado e pacote recomendado'
    },
    horas_necessarias_cliente: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00
    },
    pacote_recomendado_cliente: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    // Status e controle
    status: {
        type: DataTypes.ENUM('rascunho', 'finalizado', 'aprovado', 'rejeitado'),
        defaultValue: 'rascunho'
    },

    // Auditoria
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuário que criou'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuário que atualizou'
    }
}, {
    tableName: 'orcamentos',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['cliente_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['descricao']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['total_valor_final']
        }
    ]
});

// Associações
Orcamento.associate = (models) => {
    Orcamento.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente'
    });
};

module.exports = Orcamento;