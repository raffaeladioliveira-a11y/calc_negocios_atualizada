import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Key,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Shield,
    Calendar,
    RefreshCw,
    Filter,
    Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PermissionForm from '@/components/admin/PermissionForm';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    resource: string;
    action: string;
    group: string;
    order: number;
    is_system: boolean;
    created_at: string;
    roles_count?: number;
}

const AdminPermissions = () => {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Verificar permissões
    const canBrowsePermissions = hasPermission('permissions.browse');
    const canAddPermissions = hasPermission('permissions.add');
    const canEditPermissions = hasPermission('permissions.edit');
    const canDeletePermissions = hasPermission('permissions.delete');

    if (!canBrowsePermissions) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Acesso Negado</h3>
                    <p className="text-gray-600">Você não tem permissão para visualizar permissões.</p>
                </div>
            </div>
        );
    }

    // Carregar permissões
    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();
            const response = await fetch(`/api/permissions?_=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPermissions(data.data.permissions);
            } else {
                toast({
                    title: 'Erro ao carregar permissões',
                    description: 'Não foi possível carregar a lista de permissões.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Erro ao conectar com o servidor.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, [toast]);

    // Handlers do modal
    const handleCreatePermission = () => {
        setSelectedPermission(null);
        setDialogOpen(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setSelectedPermission(permission);
        setDialogOpen(true);
    };

    const handleFormSuccess = async () => {
        setDialogOpen(false);
        setSelectedPermission(null);
        await fetchPermissions();
        toast({
            title: 'Sucesso!',
            description: 'Permissão salva com sucesso',
        });
    };

    const handleFormCancel = () => {
        setDialogOpen(false);
        setSelectedPermission(null);
    };

    // Handler de exclusão
    const handleDeletePermission = (permission: Permission) => {
        setPermissionToDelete(permission);
        setDeleteDialogOpen(true);
    };

    const confirmDeletePermission = async () => {
        if (!permissionToDelete) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/permissions/${permissionToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: 'Permissão excluída',
                    description: 'A permissão foi removida com sucesso.',
                });
                await fetchPermissions();
            } else {
                toast({
                    title: 'Erro ao excluir permissão',
                    description: data.message || 'Não foi possível excluir a permissão.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao excluir permissão:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setPermissionToDelete(null);
        }
    };

    // Filtrar e agrupar permissões
    const filteredPermissions = permissions.filter(permission => {
        const matchesSearch =
            permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesGroup = !selectedGroup || permission.group === selectedGroup;

        return matchesSearch && matchesGroup;
    });

    // Agrupar permissões por grupo
    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        const group = permission.group || 'Outras';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    // Obter grupos únicos para o filtro
    const availableGroups = [...new Set(permissions.map(p => p.group || 'Outras'))].sort();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Permissões do Sistema</h1>
                    <p className="text-muted-foreground">
                        Gerencie as permissões disponíveis no sistema
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchPermissions}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    {canAddPermissions && (
                        <Button onClick={handleCreatePermission}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Permissão
                        </Button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-2 flex-1">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar permissões..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="">Todos os grupos</option>
                                {availableGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Permissões Agrupadas */}
            <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
                    <Card key={group}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Key className="mr-2 h-5 w-5" />
                                    {group}
                                </span>
                                <Badge variant="secondary">
                                    {groupPermissions.length} permissões
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {groupPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium">{permission.display_name}</h4>
                                                {permission.is_system && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Sistema
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {permission.description}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <span>Nome: <code className="bg-muted px-1 rounded">{permission.name}</code></span>
                                                <span>Recurso: {permission.resource}</span>
                                                <span>Ação: {permission.action}</span>
                                                {permission.roles_count !== undefined && (
                                                    <span className="flex items-center">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {permission.roles_count} papéis
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {canEditPermissions && (
                                                        <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canDeletePermissions && !permission.is_system && (
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDeletePermission(permission)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {Object.keys(groupedPermissions).length === 0 && (
                <div className="text-center py-12">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || selectedGroup ? 'Nenhuma permissão encontrada' : 'Nenhuma permissão cadastrada'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || selectedGroup
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando sua primeira permissão.'
                        }
                    </p>
                    {canAddPermissions && !searchTerm && !selectedGroup && (
                        <Button onClick={handleCreatePermission}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Permissão
                        </Button>
                    )}
                </div>
            )}

            {/* Modal de Criar/Editar Permissão */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPermission ? 'Editar Permissão' : 'Nova Permissão'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPermission
                                ? 'Atualize as informações da permissão.'
                                : 'Crie uma nova permissão no sistema.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <PermissionForm
                        permission={selectedPermission}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a permissão "{permissionToDelete?.display_name}"?
                            Esta ação não pode ser desfeita e pode afetar os papéis que possuem esta permissão.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeletePermission}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminPermissions;