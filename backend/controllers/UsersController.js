/**
 * Created by rafaela on 25/09/25.
 */
const { body, validationResult } = require('express-validator');
const { User, Role, Permission, UserRole } = require('../models');
const { Op } = require('sequelize');

class UsersController {
    // Validações para criação de usuário
    static createValidation = [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome deve ter entre 2 e 100 caracteres'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Senha deve ter no mínimo 6 caracteres'),
        body('status')
            .optional()
            .isIn(['active', 'inactive', 'suspended'])
            .withMessage('Status inválido'),
        body('role_ids')
            .optional()
            .isArray()
            .withMessage('role_ids deve ser um array')
    ];

    // Validações para atualização de usuário
    static updateValidation = [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome deve ter entre 2 e 100 caracteres'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Email inválido'),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Senha deve ter no mínimo 6 caracteres'),
        body('status')
            .optional()
            .isIn(['active', 'inactive', 'suspended'])
            .withMessage('Status inválido'),
        body('role_ids')
            .optional()
            .isArray()
            .withMessage('role_ids deve ser um array')
    ];

    // Listar usuários
    static async index(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            role_id
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            where.status = status;
        }

        // Include para roles
        const include = [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name', 'display_name', 'color'],
                ...(role_id ? { where: { id: role_id } } : {})
    }
    ];

        // Se filtrar por role_id, precisa usar include obrigatório
        if (role_id) {
            include[0].required = true;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            include,
            offset,
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
            distinct: true
        });

        // Formatar dados
        const formattedUsers = users.map(user => ({
                ...user.getSafeData(),
                roles: user.roles || []
    }));

        res.json({
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / parseInt(limit))
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Buscar usuário por ID
    static async show(req, res) {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['id', 'name', 'display_name', 'resource', 'action']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Compilar permissões
        const userPermissions = [];
        user.roles?.forEach(role => {
            role.permissions?.forEach(permission => {
            if (!userPermissions.find(p => p.name === permission.name)) {
            userPermissions.push({
                id: permission.id,
                name: permission.name,
                display_name: permission.display_name,
                resource: permission.resource,
                action: permission.action
            });
        }
    });
    });

        res.json({
            success: true,
            data: {
                user: {
                    ...user.getSafeData(),
                roles: user.roles || [],
                permissions: userPermissions
            }
        }
    });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Criar usuário
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

        const { name, email, password, avatar, status = 'active', role_ids = [] } = req.body;

        // Verificar se email já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Criar usuário
        const user = await User.create({
            name,
            email,
            password,
            avatar,
            status
        });

        // Atribuir roles se fornecidas
        if (role_ids.length > 0) {
            // Verificar se as roles existem
            const roles = await Role.findAll({
                where: { id: { [Op.in]: role_ids } }
            });

            if (roles.length !== role_ids.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uma ou mais roles fornecidas não existem'
                });
            }

            // Criar associações
            const userRoles = role_ids.map(roleId => ({
                    user_id: user.id,
                    role_id: roleId,
                    granted_by: req.user.id
                }));

            await UserRole.bulkCreate(userRoles);
        }

        // Buscar usuário completo com roles
        const createdUser = await User.findByPk(user.id, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name', 'display_name', 'color']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user: {
                    ...createdUser.getSafeData(),
                roles: createdUser.roles || []
            }
        }
    });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Atualizar usuário
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
        const { name, email, password, avatar, status, role_ids } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se email já existe (em outro usuário)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: {
                    email,
                    id: { [Op.ne]: id }
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
        }

        // Atualizar dados do usuário
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (password !== undefined) updateData.password = password;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (status !== undefined) updateData.status = status;

        await user.update(updateData);

        // Atualizar roles se fornecidas
        if (role_ids !== undefined) {
            // Remover roles atuais
            await UserRole.destroy({ where: { user_id: id } });

            // Adicionar novas roles
            if (role_ids.length > 0) {
                const roles = await Role.findAll({
                    where: { id: { [Op.in]: role_ids } }
                });

                if (roles.length !== role_ids.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Uma ou mais roles fornecidas não existem'
                    });
                }

                const userRoles = role_ids.map(roleId => ({
                        user_id: id,
                        role_id: roleId,
                        granted_by: req.user.id
                    }));

                await UserRole.bulkCreate(userRoles);
            }
        }

        // Buscar usuário atualizado
        const updatedUser = await User.findByPk(id, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name', 'display_name', 'color']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: {
                user: {
                    ...updatedUser.getSafeData(),
                roles: updatedUser.roles || []
            }
        }
    });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

    // Excluir usuário
    static async destroy(req, res) {
    try {
        const { id } = req.params;

        // Verificar se não é o próprio usuário
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível excluir seu próprio usuário'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}
}

module.exports = UsersController;