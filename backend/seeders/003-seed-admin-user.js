'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    // Primeiro, vamos limpar usuários existentes para evitar duplicatas
    await queryInterface.bulkDelete('users', {
        email: 'admin@sistema.com'
    });

    const now = new Date();

    try {
        // Criar usuário admin com senha temporária (será hasheada pelo model)
        const adminUser = {
            name: 'Administrador',
            email: 'admin@sistema.com',
            password: 'admin123', // Será hasheada pelo hook do model
            status: 'active',
            email_verified_at: now,
            created_at: now,
            updated_at: now
        };

        await queryInterface.bulkInsert('users', [adminUser]);
        console.log('✅ Admin user created successfully!');

        // Buscar o ID do usuário criado e da role super-admin
        const [users] = await queryInterface.sequelize.query(
            "SELECT id FROM users WHERE email = 'admin@sistema.com'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const [roles] = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'super-admin'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length > 0 && roles.length > 0) {
            const userId = users[0].id;
            const roleId = roles[0].id;

            // Limpar user_roles existentes para esse usuário
            await queryInterface.bulkDelete('user_roles', {
                user_id: userId
            });

            // Atribuir role super-admin ao usuário admin
            await queryInterface.bulkInsert('user_roles', [{
                user_id: userId,
                role_id: roleId,
                granted_by: userId, // Auto-atribuição
                granted_at: now,
                created_at: now,
                updated_at: now
            }]);

            console.log('✅ Super-admin role assigned successfully!');
            console.log('📧 Email: admin@sistema.com');
            console.log('🔑 Senha: admin123');
        } else {
            console.error('❌ Erro: Usuário ou role super-admin não encontrados');
            if (users.length === 0) console.error('   - Usuário não foi criado');
            if (roles.length === 0) console.error('   - Role super-admin não encontrada');
        }

    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error.message);
        throw error;
    }
},

async down(queryInterface, Sequelize) {
    try {
        // Buscar ID do usuário admin
        const [users] = await queryInterface.sequelize.query(
            "SELECT id FROM users WHERE email = 'admin@sistema.com'",
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length > 0) {
            const userId = users[0].id;

            // Remover user_roles primeiro (por causa das foreign keys)
            await queryInterface.bulkDelete('user_roles', {
                user_id: userId
            });
        }

        // Remover usuário admin
        await queryInterface.bulkDelete('users', {
            email: 'admin@sistema.com'
        });

        console.log('✅ Admin user removed successfully!');
    } catch (error) {
        console.error('❌ Erro ao remover usuário admin:', error.message);
        throw error;
    }
}
};