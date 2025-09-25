'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    // Primeiro, vamos limpar permissões existentes para evitar duplicatas
    await queryInterface.bulkDelete('permissions', {});

    const now = new Date();

    const permissions = [
        // Dashboard
        {
            name: 'dashboard.browse',
            display_name: 'Acessar Dashboard',
            description: 'Permite acesso à página do dashboard principal',
            resource: 'dashboard',
            action: 'browse',
            group: 'Menu Principal',
            order: 10,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Empresas
        {
            name: 'empresas.browse',
            display_name: 'Listar Empresas',
            description: 'Permite visualizar a listagem de empresas',
            resource: 'empresas',
            action: 'browse',
            group: 'Menu Principal',
            order: 20,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'empresas.read',
            display_name: 'Ver Detalhes de Empresas',
            description: 'Permite visualizar detalhes de uma empresa específica',
            resource: 'empresas',
            action: 'read',
            group: 'Menu Principal',
            order: 21,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'empresas.add',
            display_name: 'Criar Empresas',
            description: 'Permite criar novas empresas',
            resource: 'empresas',
            action: 'add',
            group: 'Menu Principal',
            order: 22,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'empresas.edit',
            display_name: 'Editar Empresas',
            description: 'Permite editar empresas existentes',
            resource: 'empresas',
            action: 'edit',
            group: 'Menu Principal',
            order: 23,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'empresas.delete',
            display_name: 'Excluir Empresas',
            description: 'Permite excluir empresas',
            resource: 'empresas',
            action: 'delete',
            group: 'Menu Principal',
            order: 24,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Clientes
        {
            name: 'clientes.browse',
            display_name: 'Listar Clientes',
            description: 'Permite visualizar a listagem de clientes',
            resource: 'clientes',
            action: 'browse',
            group: 'Menu Principal',
            order: 30,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'clientes.read',
            display_name: 'Ver Detalhes de Clientes',
            description: 'Permite visualizar detalhes de um cliente específico',
            resource: 'clientes',
            action: 'read',
            group: 'Menu Principal',
            order: 31,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'clientes.add',
            display_name: 'Criar Clientes',
            description: 'Permite criar novos clientes',
            resource: 'clientes',
            action: 'add',
            group: 'Menu Principal',
            order: 32,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'clientes.edit',
            display_name: 'Editar Clientes',
            description: 'Permite editar clientes existentes',
            resource: 'clientes',
            action: 'edit',
            group: 'Menu Principal',
            order: 33,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'clientes.delete',
            display_name: 'Excluir Clientes',
            description: 'Permite excluir clientes',
            resource: 'clientes',
            action: 'delete',
            group: 'Menu Principal',
            order: 34,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Calculadora
        {
            name: 'calculadora.browse',
            display_name: 'Acessar Calculadora',
            description: 'Permite acesso à calculadora de orçamentos',
            resource: 'calculadora',
            action: 'browse',
            group: 'Menu Principal',
            order: 40,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Configuração de Valores
        {
            name: 'configuracao-valores.browse',
            display_name: 'Acessar Configuração de Valores',
            description: 'Permite acesso à configuração de valores',
            resource: 'configuracao-valores',
            action: 'browse',
            group: 'Configurações',
            order: 50,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'configuracao-valores.edit',
            display_name: 'Editar Valores',
            description: 'Permite editar valores de configuração',
            resource: 'configuracao-valores',
            action: 'edit',
            group: 'Configurações',
            order: 51,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Orçamentos
        {
            name: 'orcamentos.browse',
            display_name: 'Listar Orçamentos',
            description: 'Permite visualizar a listagem de orçamentos',
            resource: 'orcamentos',
            action: 'browse',
            group: 'Menu Principal',
            order: 60,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'orcamentos.read',
            display_name: 'Ver Detalhes de Orçamentos',
            description: 'Permite visualizar detalhes de um orçamento específico',
            resource: 'orcamentos',
            action: 'read',
            group: 'Menu Principal',
            order: 61,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'orcamentos.add',
            display_name: 'Criar Orçamentos',
            description: 'Permite criar novos orçamentos',
            resource: 'orcamentos',
            action: 'add',
            group: 'Menu Principal',
            order: 62,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'orcamentos.edit',
            display_name: 'Editar Orçamentos',
            description: 'Permite editar orçamentos existentes',
            resource: 'orcamentos',
            action: 'edit',
            group: 'Menu Principal',
            order: 63,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'orcamentos.delete',
            display_name: 'Excluir Orçamentos',
            description: 'Permite excluir orçamentos',
            resource: 'orcamentos',
            action: 'delete',
            group: 'Menu Principal',
            order: 64,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Relatórios
        {
            name: 'relatorios.browse',
            display_name: 'Acessar Relatórios',
            description: 'Permite acesso aos relatórios',
            resource: 'relatorios',
            action: 'browse',
            group: 'Relatórios',
            order: 70,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Administração - Users
        {
            name: 'users.browse',
            display_name: 'Listar Usuários',
            description: 'Permite visualizar a listagem de usuários',
            resource: 'users',
            action: 'browse',
            group: 'Administração',
            order: 100,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'users.read',
            display_name: 'Ver Detalhes de Usuários',
            description: 'Permite visualizar detalhes de um usuário específico',
            resource: 'users',
            action: 'read',
            group: 'Administração',
            order: 101,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'users.add',
            display_name: 'Criar Usuários',
            description: 'Permite criar novos usuários',
            resource: 'users',
            action: 'add',
            group: 'Administração',
            order: 102,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'users.edit',
            display_name: 'Editar Usuários',
            description: 'Permite editar usuários existentes',
            resource: 'users',
            action: 'edit',
            group: 'Administração',
            order: 103,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'users.delete',
            display_name: 'Excluir Usuários',
            description: 'Permite excluir usuários',
            resource: 'users',
            action: 'delete',
            group: 'Administração',
            order: 104,
            is_system: true,
            created_at: now,
            updated_at: now
        },

        // Administração - Roles
        {
            name: 'roles.browse',
            display_name: 'Listar Papéis',
            description: 'Permite visualizar a listagem de papéis',
            resource: 'roles',
            action: 'browse',
            group: 'Administração',
            order: 110,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'roles.read',
            display_name: 'Ver Detalhes de Papéis',
            description: 'Permite visualizar detalhes de um papel específico',
            resource: 'roles',
            action: 'read',
            group: 'Administração',
            order: 111,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'roles.add',
            display_name: 'Criar Papéis',
            description: 'Permite criar novos papéis',
            resource: 'roles',
            action: 'add',
            group: 'Administração',
            order: 112,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'roles.edit',
            display_name: 'Editar Papéis',
            description: 'Permite editar papéis existentes',
            resource: 'roles',
            action: 'edit',
            group: 'Administração',
            order: 113,
            is_system: true,
            created_at: now,
            updated_at: now
        },
        {
            name: 'roles.delete',
            display_name: 'Excluir Papéis',
            description: 'Permite excluir papéis',
            resource: 'roles',
            action: 'delete',
            group: 'Administração',
            order: 114,
            is_system: true,
            created_at: now,
            updated_at: now
        }
    ];

    // Inserir em lotes menores para evitar problemas de memória
    const batchSize = 10;
    for (let i = 0; i < permissions.length; i += batchSize) {
        const batch = permissions.slice(i, i + batchSize);
        await queryInterface.bulkInsert('permissions', batch);
    }

    console.log('✅ Permissions seeded successfully!');
},

async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', {
        is_system: true
    });
}
};