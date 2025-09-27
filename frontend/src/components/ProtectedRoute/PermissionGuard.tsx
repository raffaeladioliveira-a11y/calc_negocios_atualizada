/**
 * Created by rafaela on 27/09/25.
 */
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
    children: React.ReactNode;
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    fallback?: React.ReactNode;
    showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permission,
    permissions = [],
    requireAll = false,
    role,
    roles = [],
    fallback = null,
    showFallback = false
}) => {
    const {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions
    } = useAuth();

    // Verificar permissão única
    if (permission && !hasPermission(permission)) {
        return showFallback ? <>{fallback}</> : null;
    }

    // Verificar múltiplas permissões
    if (permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasAccess) {
            return showFallback ? <>{fallback}</> : null;
        }
    }

    // Verificar papel único
    if (role && !hasRole(role)) {
        return showFallback ? <>{fallback}</> : null;
    }

    // Verificar múltiplos papéis
    if (roles.length > 0) {
        const hasAccess = roles.some(r => hasRole(r));
        if (!hasAccess) {
            return showFallback ? <>{fallback}</> : null;
        }
    }

    // Se chegou até aqui, tem acesso
    return <>{children}</>;
};

export default PermissionGuard;