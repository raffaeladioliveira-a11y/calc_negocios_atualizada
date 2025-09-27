/**
 * Created by rafaela on 25/09/25.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Shield, Palette, Users, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    module: string;
}

interface RoleFormProps {
    role?: {
        id: number;
        name: string;
        display_name: string;
        description: string;
        color: string;
        is_system: boolean;
        permissions?: Permission[];
    };
    onSuccess: () => void;
    onCancel: () => void;
}

// Cores prÃ©-definidas para os roles
const ROLE_COLORS = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Amarelo', value: '#F59E0B' },
    { name: 'Ãndigo', value: '#6366F1' },
    { name: 'Cinza', value: '#6B7280' },
    { name: 'Laranja', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
];

const RoleForm: React.FC<RoleFormProps> = ({ role, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    // Form data
    const [formData, setFormData] = useState({
            name: role?.name || '',
        display_name: role?.display_name || '',
        description: role?.description || '',
        color: role?.color || '#6B7280',
        permissionIds: role?.permissions?.map(p => p.id) || []
});

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Carregar permissÃµes disponÃ­veis
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/permissions', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPermissions(data.data.permissions);
                }
            } catch (error) {
                console.error('Erro ao carregar permissÃµes:', error);
                toast({
                    title: 'Erro ao carregar permissÃµes',
                    description: 'NÃ£o foi possÃ­vel carregar as permissÃµes disponÃ­veis.',
                    variant: 'destructive',
                });
            } finally {
                setLoadingPermissions(false);
            }
        };

        fetchPermissions();
    }, [toast]);

    // ValidaÃ§Ã£o
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome tÃ©cnico Ã© obrigatÃ³rio';
        } else if (!/^[a-z_]+$/.test(formData.name)) {
            newErrors.name = 'Nome tÃ©cnico deve conter apenas letras minÃºsculas e underscore';
        }

        if (!formData.display_name.trim()) {
            newErrors.display_name = 'Nome de exibiÃ§Ã£o Ã© obrigatÃ³rio';
        }

        if (!formData.color) {
            newErrors.color = 'Cor Ã© obrigatÃ³ria';
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
            const url = role ? `/api/roles/${role.id}` : '/api/roles';
            const method = role ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                display_name: formData.display_name,
                description: formData.description,
                color: formData.color,
                permission_ids: formData.permissionIds,
            };

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
                    title: role ? 'Papel atualizado' : 'Papel criado',
                    description: data.message,
                });
                onSuccess();
            } else {
                toast({
                    title: 'Erro ao salvar papel',
                    description: data.message || 'Erro desconhecido',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao salvar papel:', error);
            toast({
                title: 'Erro de conexÃ£o',
                description: 'NÃ£o foi possÃ­vel conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: checked
                ? [...prev.permissionIds, permissionId]
                : prev.permissionIds.filter(id => id !== permissionId)
        }));
    };

    // Agrupar permissÃµes por mÃ³dulo
    const permissionsByModule = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
    {/* Dados bÃ¡sicos */}
    <Card>
    <CardHeader>
        <CardTitle className="flex items-center">
    <Shield className="mr-2 h-4 w-4" />
        Dados do Papel
    </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        {/* Nome tÃ©cnico */}
        <div className="space-y-2">
    <Label htmlFor="name">Nome tÃ©cnico *</Label>
    <Input
        id="name"
    value={formData.name}
    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase() }))}
    placeholder="admin, user, manager..."
    className={errors.name ? 'border-red-500' : ''}
    disabled={role?.is_system}
    />
    {errors.name && (
        <p className="text-sm text-red-600">{errors.name}</p>
    )}
    <p className="text-xs text-muted-foreground">
        Apenas letras minÃºsculas e underscore. Ex: admin, user, manager
    </p>
    </div>

    {/* Nome de exibiÃ§Ã£o */}
    <div className="space-y-2">
    <Label htmlFor="display_name">Nome de exibiÃ§Ã£o *</Label>
    <Input
        id="display_name"
    value={formData.display_name}
    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
    placeholder="Administrador, UsuÃ¡rio, Gerente..."
    className={errors.display_name ? 'border-red-500' : ''}
    />
    {errors.display_name && (
        <p className="text-sm text-red-600">{errors.display_name}</p>
    )}
    </div>

    {/* DescriÃ§Ã£o */}
    <div className="space-y-2">
    <Label htmlFor="description">DescriÃ§Ã£o</Label>
    <Textarea
        id="description"
    value={formData.description}
    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
    placeholder="Descreva as responsabilidades deste papel..."
    rows={3}
        />
        </div>

        {/* Cor */}
        <div className="space-y-2">
        <Label>Cor do papel *</Label>
    <div className="flex items-center space-x-2">
    <div className="flex flex-wrap gap-2">
        {ROLE_COLORS.map((color) => (
            <button
                key={color.value}
    type="button"
    className={`w-8 h-8 rounded-full border-2 ${
        formData.color === color.value
            ? 'border-black'
            : 'border-gray-300'
        }`}
    style={{ backgroundColor: color.value }}
    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
    title={color.name}
    />
    ))}
    </div>
    <div className="flex items-center space-x-2">
    <Badge
        className="text-white"
    style={{ backgroundColor: formData.color }}
    >
    {formData.display_name || 'Preview'}
    </Badge>
    </div>
    </div>
    {errors.color && (
        <p className="text-sm text-red-600">{errors.color}</p>
    )}
    </div>
    </CardContent>
    </Card>

    {/* PermissÃµes */}
    <Card>
    <CardHeader>
        <CardTitle className="flex items-center">
    <Key className="mr-2 h-4 w-4" />
        PermissÃµes do Papel
    </CardTitle>
    </CardHeader>
    <CardContent>
    {loadingPermissions ? (
        <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando permissÃµes...</span>
    </div>
        ) : (
        <div className="space-y-6">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                <div key={module} className="space-y-3">
    <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-600 border-b pb-1">
    {module}
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modulePermissions.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
    <Checkbox
        id={`permission-${permission.id}`}
    checked={formData.permissionIds.includes(permission.id)}
    onCheckedChange={(checked) => handlePermissionToggle(permission.id, !!checked)}
    />
    <div className="flex-1 min-w-0">
    <Label
        htmlFor={`permission-${permission.id}`}
    className="cursor-pointer block"
    >
    <div className="font-medium text-sm">
        {permission.display_name}
    </div>
    <div className="text-xs text-gray-500 truncate">
        {permission.name}
    </div>
    {permission.description && (
        <div className="text-xs text-gray-400 mt-1">
            {permission.description}
    </div>
    )}
    </Label>
    </div>
    </div>
    ))}
    </div>
    </div>
    ))}
    </div>
    )}
    </CardContent>
    </Card>

    {/* BotÃµes */}
    <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onCancel}>
    Cancelar
    </Button>
    <Button type="submit" disabled={loading || loadingPermissions}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {role ? 'Atualizar Papel' : 'Criar Papel'}
    </Button>
    </div>
    </form>
    );
};

export default RoleForm;