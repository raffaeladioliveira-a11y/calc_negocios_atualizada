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
    Shield,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Users,
    Calendar,
    RefreshCw,
    Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleForm from '@/components/admin/RoleForm';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    color: string;
    is_system: boolean;
    created_at: string;
    users_count?: number;
    permissions_count?: number;
}

const AdminRoles = () => {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Verificar permissões
    const canBrowseRoles = hasPermission('roles.browse');
    const canAddRoles = hasPermission('roles.add');
    const canEditRoles = hasPermission('roles.edit');
    const canDeleteRoles = hasPermission('roles.delete');

    if (!canBrowseRoles) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Acesso Negado</h3>
                    <p className="text-gray-600">Você não tem permissão para visualizar papéis.</p>
                </div>
            </div>
        );
    }

    // Carregar roles
    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();
            const response = await fetch(`/api/roles?_=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRoles(data.data.roles);
            } else {
                toast({
                    title: 'Erro ao carregar papéis',
                    description: 'Não foi possível carregar a lista de papéis.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao carregar papéis:', error);
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
        fetchRoles();
    }, [toast]);

    // Handlers do modal
    const handleCreateRole = () => {
        setSelectedRole(null);
        setDialogOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setDialogOpen(true);
    };

    const handleFormSuccess = async () => {
        setDialogOpen(false);
        setSelectedRole(null);
        await fetchRoles();
        toast({
            title: 'Sucesso!',
            description: 'Papel salvo com sucesso',
        });
    };

    const handleFormCancel = () => {
        setDialogOpen(false);
        setSelectedRole(null);
    };

    // Handler de exclusão
    const handleDeleteRole = (role: Role) => {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/roles/${roleToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: 'Papel excluído',
                    description: 'O papel foi removido com sucesso.',
                });
                await fetchRoles();
            } else {
                toast({
                    title: 'Erro ao excluir papel',
                    description: data.message || 'Não foi possível excluir o papel.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao excluir papel:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
        }
    };

    // Filtrar roles
    const filteredRoles = roles.filter(role =>
        role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold tracking-tight">Papéis do Sistema</h1>
                    <p className="text-muted-foreground">
                        Gerencie os papéis e permissões dos usuários
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchRoles}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    {canAddRoles && (
                        <Button onClick={handleCreateRole}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Papel
                        </Button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar papéis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Roles */}
            <div className="grid gap-4">
                {filteredRoles.map((role) => (
                    <Card key={role.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                className="text-white"
                                                style={{ backgroundColor: role.color }}
                                            >
                                                {role.display_name}
                                            </Badge>
                                            {role.is_system && (
                                                <Badge variant="secondary">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Sistema
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="font-semibold">{role.name}</h3>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {role.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Users className="h-3 w-3" />
                                                <span>{role.users_count || 0} usuários</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Shield className="h-3 w-3" />
                                                <span>{role.permissions_count || 0} permissões</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Criado em {new Date(role.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {canEditRoles && (
                                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                            )}
                                            {canDeleteRoles && !role.is_system && (
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteRole(role)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Nenhum papel encontrado' : 'Nenhum papel cadastrado'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando seu primeiro papel.'
                        }
                    </p>
                    {canAddRoles && !searchTerm && (
                        <Button onClick={handleCreateRole}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Papel
                        </Button>
                    )}
                </div>
            )}

            {/* Modal de Criar/Editar Papel */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedRole ? 'Editar Papel' : 'Novo Papel'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRole
                                ? 'Atualize as informações do papel e suas permissões.'
                                : 'Crie um novo papel no sistema e defina suas permissões.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <RoleForm
                        role={selectedRole}
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
                            Tem certeza que deseja excluir o papel "{roleToDelete?.display_name}"?
                            Esta ação não pode ser desfeita e pode afetar os usuários que possuem este papel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteRole}
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

export default AdminRoles;