/**
 * Created by rafaela on 25/09/25.
 */
// Middleware para verificar permissões específicas
const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        // Verificar se usuário está autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                error: 'NOT_AUTHENTICATED'
            });
        }

        // Verificar se usuário tem a permissão necessária
        const hasPermission = req.user.permissions?.some(
            permission => permission.name === requiredPermission
    );

        if (!hasPermission) {
            return res.status(403).json({
                        success: false,
                        message: 'Acesso negado. Permissão insuficiente.',
                        error: 'INSUFFICIENT_PERMISSION',
                        required: requiredPermission,
                        user_permissions: req.user.permissions?.map(p => p.name) || []
        });
        }

        next();
    };
};

// Middleware para verificar múltiplas permissões (OR - qualquer uma serve)
const requireAnyPermission = (permissions = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const hasAnyPermission = permissions.some(requiredPerm =>
        req.user.permissions?.some(userPerm => userPerm.name === requiredPerm)
    );

        if (!hasAnyPermission) {
            return res.status(403).json({
                        success: false,
                        message: 'Acesso negado. Nenhuma das permissões necessárias encontrada.',
                        error: 'INSUFFICIENT_PERMISSION',
                        required: permissions,
                        user_permissions: req.user.permissions?.map(p => p.name) || []
        });
        }

        next();
    };
};

// Middleware para verificar múltiplas permissões (AND - todas são necessárias)
const requireAllPermissions = (permissions = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const userPermissionNames = req.user.permissions?.map(p => p.name) || [];
        const hasAllPermissions = permissions.every(requiredPerm =>
            userPermissionNames.includes(requiredPerm)
    );

        if (!hasAllPermissions) {
            const missingPermissions = permissions.filter(perm =>
                !userPermissionNames.includes(perm)
        );

            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Permissões insuficientes.',
                error: 'INSUFFICIENT_PERMISSION',
                required: permissions,
                missing: missingPermissions,
                user_permissions: userPermissionNames
            });
        }

        next();
    };
};

// Middleware para verificar se usuário tem uma role específica
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const hasRole = req.user.roles?.some(role => role.name === requiredRole);

        if (!hasRole) {
            return res.status(403).json({
                        success: false,
                        message: 'Acesso negado. Role insuficiente.',
                        error: 'INSUFFICIENT_ROLE',
                        required: requiredRole,
                        user_roles: req.user.roles?.map(r => r.name) || []
        });
        }

        next();
    };
};

// Middleware para verificar se usuário tem qualquer uma das roles
const requireAnyRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const hasAnyRole = roles.some(requiredRole =>
        req.user.roles?.some(userRole => userRole.name === requiredRole)
    );

        if (!hasAnyRole) {
            return res.status(403).json({
                        success: false,
                        message: 'Acesso negado. Nenhuma das roles necessárias encontrada.',
                        error: 'INSUFFICIENT_ROLE',
                        required: roles,
                        user_roles: req.user.roles?.map(r => r.name) || []
        });
        }

        next();
    };
};

// Middleware para verificar se é super admin
const requireSuperAdmin = requireRole('super-admin');

// Middleware para verificar se é admin (super-admin ou admin)
const requireAdmin = requireAnyRole(['super-admin', 'admin']);

// Helper function para verificar permissões programaticamente
const userHasPermission = (user, permission) => {
    return user?.permissions?.some(p => p.name === permission) || false;
};

// Helper function para verificar roles programaticamente
const userHasRole = (user, role) => {
    return user?.roles?.some(r => r.name === role) || false;
};

// Helper function para verificar qualquer uma das permissões
const userHasAnyPermission = (user, permissions) => {
    return permissions.some(perm => userHasPermission(user, perm));
};

module.exports = {
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireRole,
    requireAnyRole,
    requireSuperAdmin,
    requireAdmin,
    userHasPermission,
    userHasRole,
    userHasAnyPermission
};