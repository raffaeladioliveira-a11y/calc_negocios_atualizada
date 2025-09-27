import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Shield,
    Mail,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserForm from '@/components/admin/UserForm';

interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
    avatar?: string;
    created_at: string;
    roles: {
        id: number;
        name: string;
        display_name: string;
        color: string;
    }[];
}

const AdminUsers = () => {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);


    // Verificar permissões
    const canBrowseUsers = hasPermission('users.browse');
    const canAddUsers = hasPermission('users.add');
    const canEditUsers = hasPermission('users.edit');
    const canDeleteUsers = hasPermission('users.delete');

    if (!canBrowseUsers) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Acesso Negado</h3>
                    <p className="text-gray-600">Você não tem permissão para visualizar usuários.</p>
                </div>
            </div>
        );
    }

    // Carregar usuários
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            // Adicionar timestamp para evitar cache
            const timestamp = Date.now();
            const response = await fetch(`/api/users?_=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache', // Forçar não usar cache
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data.users);
            } else {
                toast({
                    title: 'Erro ao carregar usuários',
                    description: 'Não foi possível carregar a lista de usuários.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
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
        fetchUsers();
    }, [toast]);

    // Handlers do modal
    const handleCreateUser = () => {
        setSelectedUser(null);
        setDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleFormSuccess = async () => {
        setDialogOpen(false);
        setSelectedUser(null);

        // Forçar re-render completo
        setRefreshKey(prev => prev + 1);

        // Recarregar dados
        await fetchUsers();
    };

    const handleFormCancel = () => {
        setDialogOpen(false);
        setSelectedUser(null);
    };

    // Handler de exclusão
    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: 'Usuário excluído',
                    description: 'O usuário foi removido com sucesso.',
                });
                await fetchUsers(); // Recarregar lista
            } else {
                toast({
                    title: 'Erro ao excluir usuário',
                    description: data.message || 'Não foi possível excluir o usuário.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    // Filtrar usuários
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'suspended': return 'Suspenso';
            default: return status;
        }
    };

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
                    <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
                    <p className="text-muted-foreground">
                        Gerencie usuários do sistema e suas permissões
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fetchUsers}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    {canAddUsers && (
                        <Button onClick={handleCreateUser}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Usuário
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
                            placeholder="Buscar usuários..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Usuários */}
            <div className="grid gap-4">
                {filteredUsers.map((user) => (
                    <Card key={`${user.id}-${refreshKey}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-10 w-10">
                                        {user.avatar ? (
                                            <AvatarImage
                                                src={`${user.avatar}?v=${Date.now()}`} // Cache-busting
                                                alt={user.name}
                                                onLoad={() => console.log(`✅ Avatar carregado: ${user.name}`)}
                                                onError={(e) => {
                console.log(`❌ Erro ao carregar avatar de ${user.name}:`, user.avatar);
                e.currentTarget.style.display = 'none';
            }}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{user.name}</h3>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Criado em {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* Status */}
                                    <Badge className={getStatusColor(user.status)}>
                                        {getStatusLabel(user.status)}
                                    </Badge>

                                    {/* Roles */}
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="outline"
                                                style={{ borderColor: role.color, color: role.color }}
                                            >
                                                {role.display_name}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {canEditUsers && (
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                            )}
                                            {canDeleteUsers && (
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteUser(user)}
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

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Comece criando seu primeiro usuário.'
                        }
                    </p>
                    {canAddUsers && !searchTerm && (
                        <Button onClick={handleCreateUser}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Usuário
                        </Button>
                    )}
                </div>
            )}

            {/* Modal de Criar/Editar Usuário */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedUser
                                ? 'Atualize as informações do usuário.'
                                : 'Crie um novo usuário no sistema.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <UserForm
                        user={selectedUser}
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
                            Tem certeza que deseja excluir o usuário "{userToDelete?.name}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
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

export default AdminUsers;