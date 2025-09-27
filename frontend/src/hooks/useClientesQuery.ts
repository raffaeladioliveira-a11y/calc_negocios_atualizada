/**
 * Created by rafaela on 27/09/25.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Tipos
export interface Cliente {
    id: number;
    nome: string;
    email?: string;
    telefone?: string;
    cpf_cnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    tipo: 'pessoa_fisica' | 'pessoa_juridica';
    status: 'ativo' | 'inativo';
    observacoes?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: 'pessoa_fisica' | 'pessoa_juridica' | 'all';
    status?: 'ativo' | 'inativo' | 'all';
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

export interface ClientesResponse {
    data: Cliente[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface UseClientesQueryResult {
    // Dados
    clientes: Cliente[];
    meta: ClientesResponse['meta'] | null;

    // Estados
    loading: boolean;
    error: string | null;

    // Ações
    refetch: () => Promise<void>;
    fetchClientes: (params?: ClientesQueryParams) => Promise<void>;
    createCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<Cliente | null>;
    updateCliente: (id: number, cliente: Partial<Cliente>) => Promise<Cliente | null>;
    deleteCliente: (id: number) => Promise<boolean>;

    // Utilitários
    findClienteById: (id: number) => Cliente | undefined;
    searchClientes: (term: string) => void;
}

// Hook principal
export const useClientesQuery = (
    initialParams?: ClientesQueryParams
): UseClientesQueryResult => {
    const { toast } = useToast();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [meta, setMeta] = useState<ClientesResponse['meta'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<ClientesQueryParams>(
        initialParams || {}
    );

    // Função para buscar clientes
    const fetchClientes = useCallback(async (params?: ClientesQueryParams) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = { ...currentParams, ...params };
            setCurrentParams(queryParams);

            // Construir query string
            const searchParams = new URLSearchParams();

            if (queryParams.page) searchParams.append('page', queryParams.page.toString());
            if (queryParams.limit) searchParams.append('limit', queryParams.limit.toString());
            if (queryParams.search) searchParams.append('search', queryParams.search);
            if (queryParams.tipo && queryParams.tipo !== 'all') searchParams.append('tipo', queryParams.tipo);
            if (queryParams.status && queryParams.status !== 'all') searchParams.append('status', queryParams.status);
            if (queryParams.orderBy) searchParams.append('order_by', queryParams.orderBy);
            if (queryParams.orderDirection) searchParams.append('order_direction', queryParams.orderDirection);

            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();
            const url = `/api/clientes?${searchParams.toString()}&_=${timestamp}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data: ClientesResponse = await response.json();

            setClientes(data.data || []);
            setMeta(data.meta || null);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);

            toast({
                title: 'Erro ao carregar clientes',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [currentParams, toast]);

    // Função para recarregar com os mesmos parâmetros
    const refetch = useCallback(async () => {
        await fetchClientes(currentParams);
    }, [fetchClientes, currentParams]);

    // Criar cliente
    const createCliente = useCallback(async (
        clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Cliente | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const newCliente = result.data;

            // Atualizar lista local
            setClientes(prev => [newCliente, ...prev]);

            toast({
                title: 'Cliente criado',
                description: 'Cliente criado com sucesso!',
            });

            return newCliente;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
            setError(errorMessage);

            toast({
                title: 'Erro ao criar cliente',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Atualizar cliente
    const updateCliente = useCallback(async (
        id: number,
        clienteData: Partial<Cliente>
    ): Promise<Cliente | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/clientes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clienteData),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const updatedCliente = result.data;

            // Atualizar lista local
            setClientes(prev =>
                prev.map(cliente =>
                    cliente.id === id ? updatedCliente : cliente
                )
            );

            toast({
                title: 'Cliente atualizado',
                description: 'Cliente atualizado com sucesso!',
            });

            return updatedCliente;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
            setError(errorMessage);

            toast({
                title: 'Erro ao atualizar cliente',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Excluir cliente
    const deleteCliente = useCallback(async (id: number): Promise<boolean> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/clientes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            // Remover da lista local
            setClientes(prev => prev.filter(cliente => cliente.id !== id));

            toast({
                title: 'Cliente excluído',
                description: 'Cliente excluído com sucesso!',
            });

            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir cliente';
            setError(errorMessage);

            toast({
                title: 'Erro ao excluir cliente',
                description: errorMessage,
                variant: 'destructive',
            });

            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Buscar cliente por ID
    const findClienteById = useCallback((id: number): Cliente | undefined => {
        return clientes.find(cliente => cliente.id === id);
    }, [clientes]);

    // Busca por termo
    const searchClientes = useCallback((term: string) => {
        fetchClientes({ ...currentParams, search: term, page: 1 });
    }, [fetchClientes, currentParams]);

    // Carregar dados iniciais
    useEffect(() => {
        fetchClientes();
    }, []);

    return {
        // Dados
        clientes,
        meta,

        // Estados
        loading,
        error,

        // Ações
        refetch,
        fetchClientes,
        createCliente,
        updateCliente,
        deleteCliente,

        // Utilitários
        findClienteById,
        searchClientes,
    };
};