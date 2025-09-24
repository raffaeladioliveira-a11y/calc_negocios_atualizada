/**
 * Created by rafaela on 24/09/25.
 */
const { sequelize } = require('./config/database');
const Cliente = require('./models/Cliente');

async function testClientes() {
    try {
        console.log('🧪 Testando modelo Cliente...');

        // Testar conexão
        await sequelize.authenticate();
        console.log('✅ Conexão OK');

        // Sincronizar modelo (adiciona campo valor se não existe)
        await sequelize.sync({ alter: true });
        console.log('✅ Modelo sincronizado');

        // Verificar se campo valor existe
        const clientes = await Cliente.findAll({
            where: { status: 'Ativo' },
            limit: 3
        });

        console.log(`📊 ${clientes.length} clientes encontrados:`);
        clientes.forEach(cliente => {
            console.log(`- ${cliente.name}: R$ ${cliente.valor}/h (${cliente.empresa})`);
    });

        // Se não tem valor definido, atualizar alguns
        if (clientes.some(c => !c.valor || c.valor === 0)) {
            console.log('🔄 Atualizando valores padrão...');
            await Cliente.update(
                { valor: 180.00 },
                { where: { status: 'Ativo', valor: [null, 0] } }
            );
            console.log('✅ Valores atualizados');
        }

        console.log('🎉 Teste concluído!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await sequelize.close();
    }
}

testClientes();