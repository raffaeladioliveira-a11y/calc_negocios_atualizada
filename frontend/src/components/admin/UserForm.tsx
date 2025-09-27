/**
 * Created by rafaela on 27/09/25.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from './AvatarUpload';

interface Role {
    id: number;
    name: string;
    display_name: string;
    color: string;
    description: string;
}

interface UserFormProps {
    user?: {
        id: number;
        name: string;
        email: string;
        status: string;
        roles: Role[];
    };
    onSuccess: () => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // Form data
    const [formData, setFormData] = useState({
            name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        status: user?.status || 'active',
        roleIds: user?.roles.map(r => r.id) || []
});

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Carregar roles disponíveis
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/roles', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRoles(data.data.roles);
                }
            } catch (error) {
                console.error('Erro ao carregar roles:', error);
                toast({
                    title: 'Erro ao carregar papéis',
                    description: 'Não foi possível carregar os papéis disponíveis.',
                    variant: 'destructive',
                });
            } finally {
                setLoadingRoles(false);
            }
        };

        fetchRoles();
    }, [toast]);

    // Validação
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!user) { // Novo usuário
            if (!formData.password) {
                newErrors.password = 'Senha é obrigatória';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
            }

            if (formData.password && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Senhas não coincidem';
            }
        } else { // Editando usuário
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
            }

            if (formData.password && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Senhas não coincidem';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const url = user ? `/api/users/${user.id}` : '/api/users';
            const method = user ? 'PUT' : 'POST';

            const payload: any = {
                name: formData.name,
                email: formData.email,
                status: formData.status,
                role_ids: formData.roleIds,
            };

            // Incluir senha apenas se foi preenchida
            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: user ? 'Usuário atualizado' : 'Usuário criado',
                    description: data.message,
                });
                onSuccess();
            } else {
                toast({
                    title: 'Erro ao salvar usuário',
                    description: data.message || 'Erro desconhecido',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle role toggle
    const handleRoleToggle = (roleId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            roleIds: checked
                ? [...prev.roleIds, roleId]
                : prev.roleIds.filter(id => id !== roleId)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados básicos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dados do Usuário
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome completo do usuário"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="email@exemplo.com"
                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Foto do Usuário
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <AvatarUpload
                        currentAvatar={formData.avatar}
                        userName={formData.name || 'Usuário'}
                        onAvatarChange={(avatarUrl) => setFormData(prev => ({ ...prev, avatar: avatarUrl || '' }))}
                    />
                </CardContent>
            </Card>

            {/* Senha */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        {user ? 'Alterar Senha (opcional)' : 'Senha *'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Senha */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {user ? 'Nova senha' : 'Senha *'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder={user ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'}
                            className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirmar senha */}
                    {formData.password && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Digite a senha novamente"
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Papéis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Papéis do Usuário
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingRoles ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Carregando papéis...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={formData.roleIds.includes(role.id)}
                                        onCheckedChange={(checked) => handleRoleToggle(role.id, !!checked)}
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor={`role-${role.id}`}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <Badge
                                                variant="outline"
                                                style={{ borderColor: role.color, color: role.color }}
                                            >
                                                {role.display_name}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                        {role.description}
                      </span>
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {user ? 'Atualizar Usuário' : 'Criar Usuário'}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;