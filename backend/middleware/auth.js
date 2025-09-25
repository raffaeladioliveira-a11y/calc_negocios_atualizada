const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

// Middleware de autenticação JWT
const authMiddleware = async (req, res, next) => {
    try {
        // Extrair token do header Authorization
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido',
                error: 'MISSING_TOKEN'
            });
        }

        // Verificar formato "Bearer TOKEN"
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'INVALID_TOKEN_FORMAT'
            });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-jwt-secret-muito-seguro');

        // Buscar usuário completo com roles e permissões
        const user = await User.findByPk(decoded.userId, {
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
                message: 'Usuário não encontrado',
                error: 'USER_NOT_FOUND'
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

        // Compilar todas as permissões do usuário
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

        // Adicionar usuário e permissões ao request
        req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
                roles: user.roles?.map(role => ({
                id: role.id,
                name: role.name,
                display_name: role.display_name,
                color: role.color
            })) || [],
            permissions: userPermissions
    };

        // Atualizar último login (opcional - apenas se quiser rastrear)
        if (process.env.TRACK_LAST_LOGIN === 'true') {
            await user.update({ last_login: new Date() }, { silent: true });
        }

        next();

    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'INVALID_TOKEN'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: 'INTERNAL_ERROR'
        });
    }
};

// Middleware opcional - permite requests sem token (para rotas públicas)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        req.user = null;
        return next();
    }

    // Se tem token, usar autenticação normal
    return authMiddleware(req, res, next);
};

module.exports = {
    authMiddleware,
    optionalAuth
};