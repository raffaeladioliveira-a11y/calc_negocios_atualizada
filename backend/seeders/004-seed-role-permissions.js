/**
 * Created by rafaela on 25/09/25.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    const now = new Date();

    // Buscar todas as permissões e roles
    const [permissions] = await queryInterface.sequelize.query(
        "SELECT id, name FROM permissions"
    );

    const [roles] = await queryInterface.sequelize.query(
        "SELECT id, name FROM roles"
    );

    // Buscar ID do usuário admin para ser o granted_by
    const [adminUser] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE email = 'admin@sistema.com'"
    );

    const adminId = adminUser.length > 0 ? adminUser[0].id : null;

    // Criar mapeamentos de permissões por role
    const rolePermissions = [];

    roles.forEach(role => {
        let allowedPermissions = [];

    switch (role.name) {
        case 'super-admin':
            // Super admin tem TODAS as permissões
            allowedPermissions = permissions.map(p => p.name);
            break;

        case 'admin':
            // Admin tem quase todas, exceto gerenciar usuários e roles
            allowedPermissions = permissions
                    .filter(p => !p.name.startsWith('users.') && !p.name.startsWith('roles.'))
        .map(p => p.name);
            break;

        case 'manager':
            // Gerente: dashboard, relatórios, orçamentos (todos), clientes (todos), empresas (read only)
            allowedPermissions = [
                'dashboard.browse',
                'relatorios.browse',
                'orcamentos.browse', 'orcamentos.read', 'orcamentos.add', 'orcamentos.edit', 'orcamentos.delete',
                'clientes.browse', 'clientes.read', 'clientes.add', 'clientes.edit', 'clientes.delete',
                'empresas.browse', 'empresas.read'
            ];
            break;

        case 'operator':
            // Operador: dashboard, calculadora, orçamentos (add, edit, read), clientes (add, edit, read)
            allowedPermissions = [
                'dashboard.browse',
                'calculadora.browse',
                'orcamentos.browse', 'orcamentos.read', 'orcamentos.add', 'orcamentos.edit',
                'clientes.browse', 'clientes.read', 'clientes.add', 'clientes.edit',
                'empresas.browse', 'empresas.read'
            ];
            break;

        case 'viewer':
            // Visualizador: apenas browse e read
            allowedPermissions = permissions
                    .filter(p => p.name.includes('.browse') || p.name.includes('.read'))
        .filter(p => !p.name.startsWith('users.') && !p.name.startsWith('roles.'))
        .map(p => p.name);
            break;
    }

    // Criar as associações role-permission
    allowedPermissions.forEach(permissionName => {
        const permission = permissions.find(p => p.name === permissionName);
    if (permission) {
        rolePermissions.push({
            role_id: role.id,
            permission_id: permission.id,
            granted_by: adminId,
            granted_at: now,
            created_at: now,
            updated_at: now
        });
    }
});
});

    if (rolePermissions.length > 0) {
        await queryInterface.bulkInsert('role_permissions', rolePermissions);
        console.log(`✅ ${rolePermissions.length} permissões atribuídas às roles com sucesso!`);
    }
},

async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', {});
}
};