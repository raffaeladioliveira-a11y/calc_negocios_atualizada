/**
 * Created by rafaela on 27/09/25.
 */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Tipos das configurações
export interface Configuracoes {
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

export interface UseConfiguracoesResult {
    data: Configuracoes | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateConfiguracao: (data: Partial<Configuracoes>) => Promise<boolean>;
}

// Hook principal
export const useConfiguracoes = (): UseConfiguracoesResult => {
    const { toast } = useToast();
    const [data, setData] = useState<Configuracoes | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar configurações
    const fetchConfiguracoes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

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
                setData(result.data);
            } else {
                throw new Error('Dados de configuração não encontrados');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);

            // Se não conseguir carregar da API, usar valores padrão
            const configuracoesDefault: Configuracoes = {
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

            setData(configuracoesDefault);

            console.warn('Usando configurações padrão devido ao erro:', errorMessage);

        } finally {
            setIsLoading(false);
        }
    }, []);

    // Função para atualizar configurações
    const updateConfiguracao = useCallback(async (configData: Partial<Configuracoes>): Promise<boolean> => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/configuracoes', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);

                toast({
                    title: 'Configurações atualizadas',
                    description: 'As configurações foram salvas com sucesso!',
                });

                return true;
            } else {
                throw new Error('Erro ao salvar configurações');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
            setError(errorMessage);

            toast({
                title: 'Erro ao salvar',
                description: errorMessage,
                variant: 'destructive',
            });

            return false;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Carregar dados na inicialização
    useEffect(() => {
        fetchConfiguracoes();
    }, [fetchConfiguracoes]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchConfiguracoes,
        updateConfiguracao
    };
};

// Hook para clientes (simplificado)
export interface ClienteSimples {
    id: string;
    nome: string;
    valor: number;
    email?: string;
    telefone?: string;
}

export interface UseClientesResult {
    data: ClienteSimples[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useClientes = (): UseClientesResult => {
    const { toast } = useToast();
    const [data, setData] = useState<ClienteSimples[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para buscar clientes
    const fetchClientes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

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
                const clientesFormatados: ClienteSimples[] = result.data.map((cliente: any) => ({
                    id: String(cliente.id),
                    nome: cliente.nome || cliente.name || 'Cliente',
                    valor: cliente.valor_hora || 0,
                    email: cliente.email,
                    telefone: cliente.telefone
                }));

                setData(clientesFormatados);
            } else {
                setData([]);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
            setError(errorMessage);

            // Clientes padrão para desenvolvimento
            const clientesPadrao: ClienteSimples[] = [
                { id: "1", nome: "Tech Solutions LTDA", valor: 180 },
                { id: "2", nome: "Digital Commerce", valor: 200 },
                { id: "3", nome: "Startup Innovation", valor: 150 },
                { id: "4", nome: "Enterprise Corp", valor: 250 }
            ];

            setData(clientesPadrao);

            console.warn('Usando clientes padrão devido ao erro:', errorMessage);

        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carregar dados na inicialização
    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchClientes
    };
};