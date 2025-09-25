/**
 * Created by rafaela on 25/09/25.
 */
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Role, Permission } = require('../models');

class AuthController {
    // Validações para login
    static loginValidation = [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Senha deve ter no mínimo 6 caracteres')
    ];

    // Validações para registro
    static registerValidation = [
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
        body('password_confirmation')
            .custom((value, { req }) => {
            if (value !== req.body.password) {
    throw new Error('Confirmação de senha não confere');
}
return true;
})
];

// Login
static async login(req, res) {
    try {
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuário com roles e permissões
        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['id', 'name', 'resource', 'action', 'display_name']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Verificar senha
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Verificar se usuário está ativo
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Usuário inativo ou suspenso',
                error: 'USER_INACTIVE'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'seu-jwt-secret-muito-seguro',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Compilar permissões do usuário
        const userPermissions = [];
        user.roles?.forEach(role => {
            role.permissions?.forEach(permission => {
            if (!userPermissions.find(p => p.name === permission.name)) {
            userPermissions.push({
                id: permission.id,
                name: permission.name,
                resource: permission.resource,
                action: permission.action,
                display_name: permission.display_name
            });
        }
    });
    });

        // Atualizar último login
        await user.update({ last_login: new Date() });

        // Retornar dados do usuário (sem senha)
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    status: user.status,
                    last_login: user.last_login,
                    roles: user.roles?.map(role => ({
                    id: role.id,
                    name: role.name,
                    display_name: role.display_name,
                    color: role.color
                })) || [],
            permissions: userPermissions
    }
    }
    });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Registro de usuário (apenas para super-admin)
static async register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

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
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user: user.getSafeData()
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Obter dados do usuário logado
static async me(req, res) {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Logout (invalidar token - implementação básica)
static async logout(req, res) {
    try {
        // Em uma implementação mais robusta, você adicionaria o token a uma blacklist
        // Por agora, apenas retornamos sucesso (o frontend deve remover o token)

        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Verificar token
static async verifyToken(req, res) {
    try {
        // Se chegou até aqui, o token é válido (middleware de auth já validou)
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Alterar senha
static async changePassword(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }

        const { current_password, new_password } = req.body;
        const userId = req.user.id;

        // Buscar usuário
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const isValidPassword = await user.validatePassword(current_password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Atualizar senha
        await user.update({ password: new_password });

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

// Validação para alterar senha
static changePasswordValidation = [
    body('current_password')
        .isLength({ min: 6 })
        .withMessage('Senha atual é obrigatória'),
    body('new_password')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter no mínimo 6 caracteres'),
    body('new_password_confirmation')
        .custom((value, { req }) => {
        if (value !== req.body.new_password) {
    throw new Error('Confirmação da nova senha não confere');
}
return true;
})
];
}

module.exports = AuthController;