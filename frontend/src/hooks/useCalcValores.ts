import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

// Tipos das configurações
export interface CalcValores {
    id: number;
    valor_hora_cp: number;
    valor_hora_dg: number;
    valor_hora_lp: number;
    valor_hora_pfb: number;
    valor_hora_at: number;
    valor_hora_an: number;
    valor_hora_gp: number;
    contingencia_valor: number;
    valor_pacote_pp: number;
    valor_pacote_p: number;
    valor_pacote_m: number;
    valor_pacote_g: number;
    valor_pacote_gg: number;
    created_at?: string;
    updated_at?: string;
}

export interface Cliente {
    id: string;
    nome: string;
    valor: number;
    email?: string;
    telefone?: string;
}

// API Service
const apiService = {
    async getConfiguracoes(): Promise<CalcValores> {
        try {
            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();

            const response = await fetch(`/api/configuracoes?_=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                return result.data;
            } else {
                throw new Error('Dados de configuração não encontrados');
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações da API, usando padrões:', error);

            // Retornar configurações padrão se a API falhar
            return {
                id: 1,
                valor_hora_cp: 150,
                valor_hora_dg: 120,
                valor_hora_lp: 180,
                valor_hora_pfb: 140,
                valor_hora_at: 130,
                valor_hora_an: 160,
                valor_hora_gp: 200,
                contingencia_valor: 100,
                valor_pacote_pp: 8000,
                valor_pacote_p: 15000,
                valor_pacote_m: 28000,
                valor_pacote_g: 40000,
                valor_pacote_gg: 50000
            };
        }
    },

    async updateConfiguracoes(data: Partial<CalcValores>): Promise<CalcValores> {
        const token = localStorage.getItem('auth_token');

        const response = await fetch('/api/configuracoes', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            return result.data;
        } else {
            throw new Error('Erro ao salvar configurações');
        }
    },

    async getClientes(): Promise<Cliente[]> {
        try {
            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();

            const response = await fetch(`/api/clientes?status=ativo&limit=100&_=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.data) {
                // Mapear para o formato esperado pela calculadora
                return result.data.map((cliente: any) => ({
                    id: String(cliente.id),
                    nome: cliente.nome || cliente.name || 'Cliente',
                    valor: cliente.valor_hora || 0,
                    email: cliente.email,
                    telefone: cliente.telefone
                }));
            } else {
                throw new Error('Nenhum cliente encontrado');
            }
        } catch (error) {
            console.warn('Erro ao carregar clientes da API, usando padrões:', error);

            // Retornar clientes padrão se a API falhar
            return [
                { id: "1", nome: "Tech Solutions LTDA", valor: 180 },
                { id: "2", nome: "Digital Commerce", valor: 200 },
                { id: "3", nome: "Startup Innovation", valor: 150 },
                { id: "4", nome: "Enterprise Corp", valor: 250 }
            ];
        }
    }
};

// Hooks
export function useConfiguracoes() {
    return useQuery({
        queryKey: ['configuracoes'],
        queryFn: apiService.getConfiguracoes,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            // Não retry se for erro de autenticação
            if (error instanceof Error && error.message.includes('401')) {
                return false;
            }
            return failureCount < 2;
        }
    });
}

export function useUpdateConfiguracoes() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: apiService.updateConfiguracoes,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
            toast({
                title: "Sucesso!",
                description: "Configurações atualizadas",
            });
        },
        onError: (error) => {
            console.error('Erro ao atualizar configurações:', error);
            toast({
                title: "Erro!",
                description: "Falha ao atualizar configurações",
                variant: "destructive",
            });
        }
    });
}

export function useClientes() {
    return useQuery({
        queryKey: ['clientes'],
        queryFn: apiService.getClientes,
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            // Não retry se for erro de autenticação
            if (error instanceof Error && error.message.includes('401')) {
                return false;
            }
            return failureCount < 2;
        }
    });
}