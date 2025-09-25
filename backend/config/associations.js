/**
 * Created by rafaela on 24/09/25.
 */
/**
 * Arquivo: config/associations.js
 * Configuração das associações entre modelos
 */

const setupAssociations = () => {
    const Cliente = require('../models/Cliente');
    const Orcamento = require('../models/Orcamento');

    console.log('🔗 Configurando associações dos modelos...');

    try {
        // Orcamento pertence a um Cliente
        Orcamento.belongsTo(Cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            targetKey: 'id'
        });

        // Cliente tem muitos Orçamentos
        Cliente.hasMany(Orcamento, {
            foreignKey: 'cliente_id',
            as: 'orcamentos',
            sourceKey: 'id'
        });

        console.log('✅ Associações configuradas com sucesso:');
        console.log('   - Orcamento.belongsTo(Cliente, { as: "cliente" })');
        console.log('   - Cliente.hasMany(Orcamento, { as: "orcamentos" })');

    } catch (error) {
        console.error('❌ Erro ao configurar associações:', error);
        throw error;
    }
};

module.exports = setupAssociations;