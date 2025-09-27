import React, { createContext, useContext, useState, useEffect } from 'react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    color: string;
    permissions: Permission[];
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    status: string;
    roles: Role[];
    permissions: Permission[]; // Todas as permissões consolidadas
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    getUserPermissions: () => string[];
    getUserRoles: () => string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Consolidar permissões de todos os roles do usuário
    const consolidatePermissions = (roles: Role[]): Permission[] => {
        const permissionsMap = new Map<number, Permission>();

        roles.forEach(role => {

            role.permissions?.forEach(permission => {
                permissionsMap.set(permission.id, permission);
            });
        });

        const result = Array.from(permissionsMap.values());
        return result;
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('auth_token', data.data.token);

                // MUDAR AQUI: Usar permissões diretas do usuário se existirem
                const userData = {
                    ...data.data.user,
                    permissions: data.data.user.permissions || consolidatePermissions(data.data.user.roles || [])
                };

                setUser(userData);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro no login:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const verifyToken = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            console.log('❌ Sem token no localStorage');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const userData = {
                    ...data.data.user,
                    permissions: data.data.user.permissions || consolidatePermissions(data.data.user.roles || [])
                };

                setUser(userData);

            } else {
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar token:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const hasPermission = (permission: string): boolean => {

        if (!user || !user.permissions) {
            return false;
        }
        const result = user.permissions.some(p => p.name === permission);
        return result;
    };

    // Verificar se usuário tem um papel específico
    const hasRole = (role: string): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.some(r => r.name === role);
    };

    // Verificar se usuário tem pelo menos uma das permissões
    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user || !user.permissions) return false;
        return permissions.some(permission => hasPermission(permission));
    };

    // Verificar se usuário tem todas as permissões
    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user || !user.permissions) return false;
        return permissions.every(permission => hasPermission(permission));
    };

    // Obter todas as permissões do usuário
    const getUserPermissions = (): string[] => {
        if (!user || !user.permissions) return [];
        return user.permissions.map(p => p.name);
    };

    // Obter todos os papéis do usuário
    const getUserRoles = (): string[] => {
        if (!user || !user.roles) return [];
        return user.roles.map(r => r.name);
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        getUserPermissions,
        getUserRoles,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};