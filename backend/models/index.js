const { sequelize } = require('../config/database');

// Função helper para verificar se é uma função ou classe
function initializeModel(ModelDefiner, sequelize) {
    if (typeof ModelDefiner === 'function') {
        try {
            // Tentar como função primeiro (nossos novos models)
            return ModelDefiner(sequelize);
        } catch (error) {
            // Se falhar, pode ser uma classe ES6
            if (error.message.includes('cannot be invoked without')) {
                return ModelDefiner; // Retornar a classe diretamente
            }
            throw error;
        }
    }
    return ModelDefiner; // Se não for função, retornar como está
}

// Inicializar models apenas os que criamos (ACL)
const models = {};

// Models de ACL (que sabemos que existem)
try {
    const UserModel = require('./User');
    models.User = initializeModel(UserModel, sequelize);
    console.log('✅ Model User carregado');
} catch (error) {
    console.log('⚠️ Model User não encontrado:', error.message);
}

try {
    const RoleModel = require('./Role');
    models.Role = initializeModel(RoleModel, sequelize);
    console.log('✅ Model Role carregado');
} catch (error) {
    console.log('⚠️ Model Role não encontrado:', error.message);
}

try {
    const PermissionModel = require('./Permission');
    models.Permission = initializeModel(PermissionModel, sequelize);
    console.log('✅ Model Permission carregado');
} catch (error) {
    console.log('⚠️ Model Permission não encontrado:', error.message);
}

try {
    const UserRoleModel = require('./UserRole');
    models.UserRole = initializeModel(UserRoleModel, sequelize);
    console.log('✅ Model UserRole carregado');
} catch (error) {
    console.log('⚠️ Model UserRole não encontrado:', error.message);
}

try {
    const RolePermissionModel = require('./RolePermission');
    models.RolePermission = initializeModel(RolePermissionModel, sequelize);
    console.log('✅ Model RolePermission carregado');
} catch (error) {
    console.log('⚠️ Model RolePermission não encontrado:', error.message);
}

// Models existentes (vamos tentar carregar mas não quebrar se não conseguir)
try {
    const ClienteModel = require('./Cliente');
    models.Cliente = ClienteModel; // Assumir que é classe ES6
    console.log('✅ Model Cliente carregado (classe existente)');
} catch (error) {
    console.log('⚠️ Model Cliente não carregado:', error.message);
}

try {
    const OrcamentoModel = require('./Orcamento');
    models.Orcamento = OrcamentoModel; // Assumir que é classe ES6
    console.log('✅ Model Orcamento carregado (classe existente)');
} catch (error) {
    console.log('⚠️ Model Orcamento não carregado:', error.message);
}

try {
    const CalcValoresModel = require('./CalcValores');
    models.CalcValores = CalcValoresModel; // Assumir que é classe ES6
    console.log('✅ Model CalcValores carregado (classe existente)');
} catch (error) {
    console.log('⚠️ Model CalcValores não carregado:', error.message);
}

// Configurar associações apenas para models ACL que têm o método associate
Object.keys(models).forEach(modelName => {
    if (models[modelName] && models[modelName].associate && typeof models[modelName].associate === 'function') {
    try {
        models[modelName].associate(models);
        console.log(`✅ Associações configuradas para ${modelName}`);
    } catch (error) {
        console.log(`⚠️ Erro ao configurar associações para ${modelName}:`, error.message);
    }
}
});

// Exportar models e instância do sequelize
module.exports = {
    sequelize,
    ...models
};

// Log para debug
console.log(`📚 Models disponíveis: ${Object.keys(models).join(', ')}`);