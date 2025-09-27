/**
 * Created by rafaela on 27/09/25.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Key, Settings, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

interface PermissionFormProps {
    permission?: Permission;
    onSuccess: () => void;
    onCancel: () => void;
}

// Grupos disponíveis
const AVAILABLE_GROUPS = [
    'Menu Principal',
    'Administração',
    'Configurações',
    'Relatórios',
    'Sistema'
];

// Ações comuns
const COMMON_ACTIONS = [
    'browse',
    'read',
    'add',
    'edit',
    'delete',
    'export',
    'import',
    'approve',
    'reject'
];

// Recursos comuns
const COMMON_RESOURCES = [
    'dashboard',
    'empresas',
    'clientes',
    'calculadora',
    'orcamentos',
    'relatorios',
    'users',
    'roles',
    'permissions',
    'config'
];

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
            name: permission?.name || '',
        display_name: permission?.display_name || '',
        description: permission?.description || '',
        resource: permission?.resource || '',
        action: permission?.action || '',
        group: permission?.group || 'Sistema',
        order: permission?.order || 100
});

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-gerar nome técnico baseado no resource e action
    const generateTechnicalName = () => {
        if (formData.resource && formData.action) {
            const technicalName = `${formData.resource}.${formData.action}`;
            setFormData(prev => ({ ...prev, name: technicalName }));
        }
    };

    // Validação
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome técnico é obrigatório';
        } else if (!/^[a-z0-9-_.]+$/.test(formData.name)) {
            newErrors.name = 'Nome técnico deve conter apenas letras minúsculas, números, pontos, hífens e underscores';
        }

        if (!formData.display_name.trim()) {
            newErrors.display_name = 'Nome de exibição é obrigatório';
        }

        if (!formData.resource.trim()) {
            newErrors.resource = 'Recurso é obrigatório';
        }

        if (!formData.action.trim()) {
            newErrors.action = 'Ação é obrigatória';
        }

        if (!formData.group.trim()) {
            newErrors.group = 'Grupo é obrigatório';
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
            const url = permission ? `/api/permissions/${permission.id}` : '/api/permissions';
            const method = permission ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                display_name: formData.display_name,
                description: formData.description,
                resource: formData.resource,
                action: formData.action,
                group: formData.group,
                order: formData.order,
                is_system: false // Permissões criadas via interface não são do sistema
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
                    title: permission ? 'Permissão atualizada' : 'Permissão criada',
                    description: data.message,
                });
                onSuccess();
            } else {
                toast({
                    title: 'Erro ao salvar permissão',
                    description: data.message || 'Erro desconhecido',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro ao salvar permissão:', error);
            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Dados básicos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Key className="mr-2 h-4 w-4" />
                        Dados da Permissão
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Resource e Action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="resource">Recurso *</Label>
                            <Select
                                value={formData.resource}
                                onValueChange={(value) => {
                                    setFormData(prev => ({ ...prev, resource: value }));
                                    setTimeout(generateTechnicalName, 0);
                                }}
                            >
                                <SelectTrigger className={errors.resource ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione o recurso" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_RESOURCES.map((resource) => (
                                        <SelectItem key={resource} value={resource}>
                                            {resource}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.resource && (
                                <p className="text-sm text-red-600">{errors.resource}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                O recurso que esta permissão controla (ex: users, roles, orcamentos)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="action">Ação *</Label>
                            <Select
                                value={formData.action}
                                onValueChange={(value) => {
                                    setFormData(prev => ({ ...prev, action: value }));
                                    setTimeout(generateTechnicalName, 0);
                                }}
                            >
                                <SelectTrigger className={errors.action ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione a ação" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_ACTIONS.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.action && (
                                <p className="text-sm text-red-600">{errors.action}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                A ação permitida (ex: browse, add, edit, delete)
                            </p>
                        </div>
                    </div>

                    {/* Nome técnico */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome técnico *</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase() }))}
                                placeholder="recurso.acao"
                                className={errors.name ? 'border-red-500' : ''}
                                disabled={permission?.is_system}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateTechnicalName}
                                disabled={!formData.resource || !formData.action}
                            >
                                <Code className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Nome usado internamente. Será gerado automaticamente se deixar vazio.
                        </p>
                    </div>

                    {/* Nome de exibição */}
                    <div className="space-y-2">
                        <Label htmlFor="display_name">Nome de exibição *</Label>
                        <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                            placeholder="Nome amigável da permissão"
                            className={errors.display_name ? 'border-red-500' : ''}
                        />
                        {errors.display_name && (
                            <p className="text-sm text-red-600">{errors.display_name}</p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva o que esta permissão permite fazer..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Organização */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Organização
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Grupo */}
                    <div className="space-y-2">
                        <Label htmlFor="group">Grupo *</Label>
                        <Select value={formData.group} onValueChange={(value) => setFormData(prev => ({ ...prev, group: value }))}>
                            <SelectTrigger className={errors.group ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecione o grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_GROUPS.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.group && (
                            <p className="text-sm text-red-600">{errors.group}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Grupo para organização visual das permissões
                        </p>
                    </div>

                    {/* Ordem */}
                    <div className="space-y-2">
                        <Label htmlFor="order">Ordem de exibição</Label>
                        <Input
                            id="order"
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 100 }))}
                            placeholder="100"
                            min="1"
                            max="999"
                        />
                        <p className="text-xs text-muted-foreground">
                            Ordem de exibição dentro do grupo (menor valor = aparece primeiro)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {permission ? 'Atualizar Permissão' : 'Criar Permissão'}
                </Button>
            </div>
        </div>
    );
};

export default PermissionForm;