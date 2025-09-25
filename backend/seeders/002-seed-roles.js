'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    // Primeiro, vamos limpar roles existentes para evitar duplicatas
    await queryInterface.bulkDelete('roles', {});

    const now = new Date();

    const roles = [
        {
            name: 'super-admin',
            display_name: 'Super Administrador',
            description: 'Administrador com acesso total ao sistema. Pode gerenciar usuários, papéis e permissões.',
            color: '#DC2626', // Vermelho
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'admin',
            display_name: 'Administrador',
            description: 'Administrador com acesso a maioria das funcionalidades, exceto gerenciamento de usuários.',
            color: '#EA580C', // Laranja
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'manager',
            display_name: 'Gerente',
            description: 'Gerente com acesso a relatórios, orçamentos e clientes.',
            color: '#0EA5E9', // Azul
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'operator',
            display_name: 'Operador',
            description: 'Operador com acesso básico para criar orçamentos e gerenciar clientes.',
            color: '#10B981', // Verde
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'viewer',
            display_name: 'Visualizador',
            description: 'Usuário com acesso apenas de visualização.',
            color: '#6B7280', // Cinza
            is_system: true,
            created_at: now,
            updated_at: now
        }
    ];

    await queryInterface.bulkInsert('roles', roles);
    console.log('✅ Roles seeded successfully!');
},

async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
        is_system: true
    });
}
};