import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
    requiredPermissions?: string[];
    requireAll?: boolean; // Se true, precisa de todas as permissões. Se false, precisa de pelo menos uma
    requiredRole?: string;
    requiredRoles?: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermission,
    requiredPermissions = [],
    requireAll = false,
    requiredRole,
    requiredRoles = [],
    fallback,
    redirectTo
}) => {
    const {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        user,
        getUserPermissions,
        getUserRoles
    } = useAuth();

    // Verificar permissão única
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return renderAccessDenied('Permissão necessária: ' + requiredPermission);
    }

    // Verificar múltiplas permissões
    if (requiredPermissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(requiredPermissions)
            : hasAnyPermission(requiredPermissions);

        if (!hasAccess) {
            const message = requireAll
                ? 'Todas as permissões necessárias: ' + requiredPermissions.join(', ')
                : 'Pelo menos uma permissão necessária: ' + requiredPermissions.join(', ');
            return renderAccessDenied(message);
        }
    }

    // Verificar papel único
    if (requiredRole && !hasRole(requiredRole)) {
        return renderAccessDenied('Papel necessário: ' + requiredRole);
    }

    // Verificar múltiplos papéis
    if (requiredRoles.length > 0) {
        const hasAccess = requiredRoles.some(role => hasRole(role));
        if (!hasAccess) {
            return renderAccessDenied('Um dos papéis necessários: ' + requiredRoles.join(', '));
        }
    }

    // Se chegou até aqui, tem acesso
    return <>{children}</>;

    function renderAccessDenied(message: string) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex items-center justify-center min-h-96 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Acesso Negado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Você não possui as permissões necessárias para acessar esta página.
                        </p>

                        <div className="bg-gray-50 p-3 rounded-lg text-left">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                                Detalhes do acesso:
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                                {message}
                            </p>
                            <div className="text-xs text-gray-500">
                                <p><strong>Suas permissões:</strong> {getUserPermissions().join(', ') || 'Nenhuma'}</p>
                                <p><strong>Seus papéis:</strong> {getUserRoles().join(', ') || 'Nenhum'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Entre em contato com o administrador se acredita que deveria ter acesso</span>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="w-full"
                        >
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
};

export default ProtectedRoute;