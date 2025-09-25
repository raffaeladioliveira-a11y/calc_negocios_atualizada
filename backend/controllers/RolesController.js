const { body, validationResult } = require('express-validator');
const { Role, Permission, User, RolePermission } = require('../models');
const { Op } = require('sequelize');

class RolesController {
    // Validações para criação/atualização de role
    static validation = [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .matches(/^[a-z0-9-_]+$/)
            .withMessage('Nome deve ter 2-50 caracteres e conter apenas letras minúsculas, números, hífen e underscore'),
        body('display_name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome de exibição deve ter entre 2 e 100 caracteres'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Descrição não pode ter mais de 500 caracteres'),
        body('color')
            .optional()
            .matches(/^#[0-9A-Fa-f]{6}$/)
            .withMessage('Cor deve ser um código hex válido (ex: #FF5733)'),
        body('permission_ids')
            .optional()
            .isArray()
            .withMessage('permission_ids deve ser um array')
    ];

    // Listar roles
    static async index(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            include_permissions = false
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { display_name: { [Op.like]: `%${search}%` } }
            ];
        }

        const include = [];

        // Incluir permissões se solicitado
        if (include_permissions === 'true') {
            include.push({
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'name', 'display_name', 'resource', 'action', 'group']
            });
        }

        // Sempre incluir contagem de usuários
        include.push({
            model: User,
            as: 'users',
            attributes: []
        });

        const { count, rows: roles } = await Role.findAndCountAll({
            where,
            include,
            offset,
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
            distinct: true,
            attributes: {
                include: [
                    [
                        Role.sequelize.fn('COUNT', Role.sequelize.fn('DISTINCT', Role.sequelize.col('users.id'))),
                        'user_count'
                    ]
                ]
            },
            group: ['Role.id'],
            subQuery: false
        });

        res.json({
            success: true,
            data: {
                roles: roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    display_name: role.display_name,
                    description: role.description,
                    color: role.color,
                    is_system: role.is_system,
                    user_count: parseInt(role.getDataValue('user_count')) || 0,
                    permissions: role.permissions || [],
                    created_at: role.created_at,
                    updated_at: role.updated_at
                })),
            pagination: {
            page: parseInt(page),
                limit: parseInt(limit),
                total: count.length || 0,
                pages: Math.ceil((count.length || 0) / parseInt(limit))
        }
    }
    });

    } catch (error) {
        console.error('Erro ao listar roles:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Buscar role por ID
    static async show(req, res) {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'name', 'display_name', 'resource', 'action', 'group', 'order']
                },
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'name', 'email', 'status']
                }
            ]
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role não encontrada'
            });
        }

        res.json({
            success: true,
            data: {
                role: {
                    id: role.id,
                    name: role.name,
                    display_name: role.display_name,
                    description: role.description,
                    color: role.color,
                    is_system: role.is_system,
                    permissions: role.permissions || [],
                    users: role.users || [],
                    user_count: (role.users || []).length,
                    created_at: role.created_at,
                    updated_at: role.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar role:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Criar role
    static async create(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const {
            name,
            display_name,
            description,
            color = '#6B7280',
            permission_ids = []
        } = req.body;

        // Gerar name automaticamente se não fornecido
        const roleName = name || display_name.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-');

        // Verificar se name já existe
        const existingRole = await Role.findOne({ where: { name: roleName } });
        if (existingRole) {
            return res.status(409).json({
                success: false,
                message: 'Nome da role já está em uso'
            });
        }

        // Criar role
        const role = await Role.create({
            name: roleName,
            display_name,
            description,
            color,
            is_system: false
        });

        // Atribuir permissões se fornecidas
        if (permission_ids.length > 0) {
            // Verificar se as permissões existem
            const permissions = await Permission.findAll({
                where: { id: { [Op.in]: permission_ids } }
            });

            if (permissions.length !== permission_ids.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uma ou mais permissões fornecidas não existem'
                });
            }

            // Criar associações
            const rolePermissions = permission_ids.map(permissionId => ({
                    role_id: role.id,
                    permission_id: permissionId,
                    granted_by: req.user.id
                }));

            await RolePermission.bulkCreate(rolePermissions);
        }

        // Buscar role completa com permissões
        const createdRole = await Role.findByPk(role.id, {
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'name', 'display_name', 'resource', 'action']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Role criada com sucesso',
            data: {
                role: {
                    id: createdRole.id,
                    name: createdRole.name,
                    display_name: createdRole.display_name,
                    description: createdRole.description,
                    color: createdRole.color,
                    is_system: createdRole.is_system,
                    permissions: createdRole.permissions || [],
                    created_at: createdRole.created_at,
                    updated_at: createdRole.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao criar role:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Atualizar role
    static async update(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { name, display_name, description, color, permission_ids } = req.body;

        const role = await Role.findByPk(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role não encontrada'
            });
        }

        // Verificar se é role do sistema
        if (role.is_system) {
            return res.status(400).json({
                success: false,
                message: 'Roles do sistema não podem ser editadas'
            });
        }

        // Verificar se name já existe (em outra role)
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({
                where: {
                    name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingRole) {
                return res.status(409).json({
                    success: false,
                    message: 'Nome da role já está em uso'
                });
            }
        }

        // Atualizar dados da role
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (display_name !== undefined) updateData.display_name = display_name;
        if (description !== undefined) updateData.description = description;
        if (color !== undefined) updateData.color = color;

        await role.update(updateData);

        // Atualizar permissões se fornecidas
        if (permission_ids !== undefined) {
            // Remover permissões atuais
            await RolePermission.destroy({ where: { role_id: id } });

            // Adicionar novas permissões
            if (permission_ids.length > 0) {
                const permissions = await Permission.findAll({
                    where: { id: { [Op.in]: permission_ids } }
                });

                if (permissions.length !== permission_ids.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Uma ou mais permissões fornecidas não existem'
                    });
                }

                const rolePermissions = permission_ids.map(permissionId => ({
                        role_id: id,
                        permission_id: permissionId,
                        granted_by: req.user.id
                    }));

                await RolePermission.bulkCreate(rolePermissions);
            }
        }

        // Buscar role atualizada
        const updatedRole = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'name', 'display_name', 'resource', 'action']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Role atualizada com sucesso',
            data: {
                role: {
                    id: updatedRole.id,
                    name: updatedRole.name,
                    display_name: updatedRole.display_name,
                    description: updatedRole.description,
                    color: updatedRole.color,
                    is_system: updatedRole.is_system,
                    permissions: updatedRole.permissions || [],
                    created_at: updatedRole.created_at,
                    updated_at: updatedRole.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar role:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Excluir role
    static async destroy(req, res) {
    try {
        const { id } = req.params;

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'users'
                }
            ]
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role não encontrada'
            });
        }

        // Verificar se é role do sistema
        if (role.is_system) {
            return res.status(400).json({
                success: false,
                message: 'Roles do sistema não podem ser excluídas'
            });
        }

        // Verificar se há usuários com esta role
        if (role.users && role.users.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Não é possível excluir role com ${role.users.length} usuário(s) atribuído(s)`
            });
        }

        await role.destroy();

        res.json({
            success: true,
            message: 'Role excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir role:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Listar todas as permissões (para o painel de criação/edição de roles)
    static async permissions(req, res) {
    try {
        const permissions = await Permission.findAll({
            order: [['group', 'ASC'], ['order', 'ASC'], ['display_name', 'ASC']]
        });

        // Organizar por grupos
        const groupedPermissions = {};
        permissions.forEach(permission => {
            const group = permission.group || 'Outras';
        if (!groupedPermissions[group]) {
            groupedPermissions[group] = [];
        }
        groupedPermissions[group].push({
            id: permission.id,
            name: permission.name,
            display_name: permission.display_name,
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
            order: permission.order
        });
    });

        res.json({
            success: true,
            data: {
                permissions: permissions.map(p => ({
                    id: p.id,
                    name: p.name,
                    display_name: p.display_name,
                    description: p.description,
                    resource: p.resource,
                    action: p.action,
                    group: p.group || 'Outras',
                    order: p.order
                })),
            grouped_permissions: groupedPermissions
    }
    });

    } catch (error) {
        console.error('Erro ao listar permissões:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}
}

module.exports = RolesController;