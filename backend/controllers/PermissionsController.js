/**
 * Created by rafaela on 25/09/25.
 */
/**
 * Created by rafaela on 25/09/25.
 */
const { body, validationResult } = require('express-validator');
const { Permission, Role } = require('../models');
const { Op } = require('sequelize');

class PermissionsController {
    // Validações para criação/atualização de permission
    static validation = [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .matches(/^[a-z0-9-_.]+$/)
            .withMessage('Nome deve ter 2-100 caracteres e conter apenas letras minúsculas, números, pontos, hífen e underscore'),
        body('display_name')
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage('Nome de exibição deve ter entre 2 e 150 caracteres'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Descrição não pode ter mais de 500 caracteres'),
        body('resource')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Recurso deve ter entre 2 e 50 caracteres'),
        body('action')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Ação deve ter entre 2 e 50 caracteres'),
        body('group')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Grupo deve ter entre 2 e 100 caracteres'),
        body('order')
            .optional()
            .isInt({ min: 1, max: 999 })
            .withMessage('Ordem deve ser um número entre 1 e 999')
    ];

    // Listar permissions
    static async getAll(req, res) {
    try {
        const {
            page = 1,
            limit = 50,
            search,
            group,
            resource
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { display_name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (group) {
            where.group = group;
        }

        if (resource) {
            where.resource = resource;
        }

        const { count, rows: permissions } = await Permission.findAndCountAll({
            where,
            offset,
            limit: parseInt(limit),
            order: [['group', 'ASC'], ['order', 'ASC'], ['display_name', 'ASC']],
            distinct: true
        });

        // Buscar contagem de roles para cada permission
        const permissionsWithCounts = await Promise.all(permissions.map(async (permission) => {
                const rolesCount = await Role.count({
                include: [{
                    model: Permission,
                    as: 'permissions',
                    where: { id: permission.id }
                }]
            });

        return {
            id: permission.id,
            name: permission.name,
            display_name: permission.display_name,
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
            group: permission.group,
            order: permission.order,
            is_system: permission.is_system,
            roles_count: rolesCount,
            created_at: permission.created_at,
            updated_at: permission.updated_at
        };
    }));

        res.json({
            success: true,
            data: {
                permissions: permissionsWithCounts,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / parseInt(limit)),
                    total_items: count,
                    items_per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Erro ao listar permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Buscar permission por ID
    static async getById(req, res) {
    try {
        const { id } = req.params;

        const permission = await Permission.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name', 'display_name', 'color']
                }
            ]
        });

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permissão não encontrada'
            });
        }

        res.json({
            success: true,
            data: {
                permission: {
                    id: permission.id,
                    name: permission.name,
                    display_name: permission.display_name,
                    description: permission.description,
                    resource: permission.resource,
                    action: permission.action,
                    group: permission.group,
                    order: permission.order,
                    is_system: permission.is_system,
                    roles: permission.roles || [],
                    created_at: permission.created_at,
                    updated_at: permission.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar permission:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Criar permission
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
            resource,
            action,
            group,
            order = 100
        } = req.body;

        // Verificar se name já existe
        const existingPermission = await Permission.findOne({ where: { name } });
        if (existingPermission) {
            return res.status(409).json({
                success: false,
                message: 'Nome da permissão já está em uso'
            });
        }

        // Criar permission
        const permission = await Permission.create({
            name,
            display_name,
            description,
            resource,
            action,
            group,
            order,
            is_system: false
        });

        console.log(`✅ Permissão criada: ${permission.display_name} (${permission.name})`);

        res.status(201).json({
            success: true,
            message: 'Permissão criada com sucesso',
            data: {
                permission: {
                    id: permission.id,
                    name: permission.name,
                    display_name: permission.display_name,
                    description: permission.description,
                    resource: permission.resource,
                    action: permission.action,
                    group: permission.group,
                    order: permission.order,
                    is_system: permission.is_system,
                    created_at: permission.created_at,
                    updated_at: permission.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao criar permission:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
        });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Atualizar permission
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
        const { name, display_name, description, resource, action, group, order } = req.body;

        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permissão não encontrada'
            });
        }

        // Verificar se é permission do sistema
        if (permission.is_system && name !== permission.name) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível alterar o nome de permissões do sistema'
            });
        }

        // Verificar se novo nome já existe (em outra permission)
        if (name && name !== permission.name) {
            const existingPermission = await Permission.findOne({
                where: {
                    name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingPermission) {
                return res.status(409).json({
                    success: false,
                    message: 'Nome da permissão já está em uso'
                });
            }
        }

        // Atualizar dados da permission
        const updateData = {};
        if (name !== undefined) updateData.name = permission.is_system ? permission.name : name;
        if (display_name !== undefined) updateData.display_name = display_name;
        if (description !== undefined) updateData.description = description;
        if (resource !== undefined) updateData.resource = resource;
        if (action !== undefined) updateData.action = action;
        if (group !== undefined) updateData.group = group;
        if (order !== undefined) updateData.order = order;

        await permission.update(updateData);

        console.log(`✅ Permissão atualizada: ${permission.display_name}`);

        res.json({
            success: true,
            message: 'Permissão atualizada com sucesso',
            data: {
                permission: {
                    id: permission.id,
                    name: permission.name,
                    display_name: permission.display_name,
                    description: permission.description,
                    resource: permission.resource,
                    action: permission.action,
                    group: permission.group,
                    order: permission.order,
                    is_system: permission.is_system,
                    created_at: permission.created_at,
                    updated_at: permission.updated_at
                }
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar permission:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
        });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Excluir permission
    static async delete(req, res) {
    try {
        const { id } = req.params;

        const permission = await Permission.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: 'roles'
                }
            ]
        });

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'Permissão não encontrada'
            });
        }

        // Verificar se é permission do sistema
        if (permission.is_system) {
            return res.status(400).json({
                success: false,
                message: 'Permissões do sistema não podem ser excluídas'
            });
        }

        // Verificar se há roles usando esta permission
        if (permission.roles && permission.roles.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Não é possível excluir permissão com ${permission.roles.length} papel(éis) associado(s)`
            });
        }

        await permission.destroy();

        console.log(`✅ Permissão excluída: ${permission.display_name}`);

        res.json({
            success: true,
            message: 'Permissão excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir permission:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Listar grupos disponíveis
    static async getGroups(req, res) {
    try {
        const groups = await Permission.findAll({
            attributes: ['group'],
            group: ['group'],
            order: [['group', 'ASC']]
        });

        const groupList = groups.map(g => g.group).filter(Boolean);

        res.json({
            success: true,
            data: {
                groups: groupList
            }
        });

    } catch (error) {
        console.error('Erro ao listar grupos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Listar recursos disponíveis
    static async getResources(req, res) {
    try {
        const resources = await Permission.findAll({
            attributes: ['resource'],
            group: ['resource'],
            order: [['resource', 'ASC']]
        });

        const resourceList = resources.map(r => r.resource).filter(Boolean);

        res.json({
            success: true,
            data: {
                resources: resourceList
            }
        });

    } catch (error) {
        console.error('Erro ao listar recursos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}
}

module.exports = PermissionsController;