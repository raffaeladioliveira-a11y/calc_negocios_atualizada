import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Tipos
export interface ItemOrcamento {
    id?: number;
    produto_servico: string;
    descricao?: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
    categoria?: string;
}

export interface Orcamento {
    id: number;
    numero: string;
    cliente_id: number;
    cliente_nome?: string;
    cliente_email?: string;
    cliente_telefone?: string;
    titulo: string;
    descricao?: string;
    status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
    valor_total: number;
    valor_desconto?: number;
    valor_final: number;
    validade_dias: number;
    data_validade: string;
    observacoes?: string;
    condicoes_pagamento?: string;
    prazo_entrega?: string;
    garantia?: string;
    itens: ItemOrcamento[];
    created_at: string;
    updated_at: string;
    created_by?: number;
    created_by_name?: string;
}

export interface OrcamentosQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado' | 'all';
    cliente_id?: number;
    data_inicio?: string;
    data_fim?: string;
    valor_min?: number;
    valor_max?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

export interface OrcamentosResponse {
    data: Orcamento[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary?: {
        total_orcamentos: number;
        valor_total: number;
        por_status: Record<string, number>;
    };
}

export interface UseOrcamentosResult {
    // Dados
    orcamentos: Orcamento[];
    meta: OrcamentosResponse['meta'] | null;
    summary: OrcamentosResponse['summary'] | null;

    // Estados
    loading: boolean;
    error: string | null;

    // Ações CRUD
    refetch: () => Promise<void>;
    fetchOrcamentos: (params?: OrcamentosQueryParams) => Promise<void>;
    createOrcamento: (orcamento: any) => Promise<Orcamento | null>;
    updateOrcamento: (id: number, orcamento: Partial<Orcamento>) => Promise<Orcamento | null>;
    deleteOrcamento: (id: number) => Promise<boolean>;

    // Ações específicas de orçamento
    duplicateOrcamento: (id: number) => Promise<Orcamento | null>;
    changeStatus: (id: number, status: Orcamento['status']) => Promise<Orcamento | null>;
    sendOrcamento: (id: number, email?: string) => Promise<boolean>;
    generatePDF: (id: number) => Promise<Blob | null>;

    // Utilitários
    findOrcamentoById: (id: number) => Orcamento | undefined;
    searchOrcamentos: (term: string) => void;
    filterByStatus: (status: Orcamento['status'] | 'all') => void;
    filterByCliente: (clienteId: number | null) => void;
}

// Hook principal
export const useOrcamentos = (
    initialParams?: OrcamentosQueryParams
): UseOrcamentosResult => {
    const { toast } = useToast();

    // INICIALIZAÇÃO CORRETA DOS ESTADOS - SEMPRE ARRAYS/OBJETOS VÁLIDOS
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [meta, setMeta] = useState<OrcamentosResponse['meta'] | null>(null);
    const [summary, setSummary] = useState<OrcamentosResponse['summary'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentParams, setCurrentParams] = useState<OrcamentosQueryParams>(
        initialParams || {}
    );

    // Função para buscar orçamentos
    const fetchOrcamentos = useCallback(async (params?: OrcamentosQueryParams) => {
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
            if (queryParams.status && queryParams.status !== 'all') searchParams.append('status', queryParams.status);
            if (queryParams.cliente_id) searchParams.append('cliente_id', queryParams.cliente_id.toString());
            if (queryParams.data_inicio) searchParams.append('data_inicio', queryParams.data_inicio);
            if (queryParams.data_fim) searchParams.append('data_fim', queryParams.data_fim);
            if (queryParams.valor_min) searchParams.append('valor_min', queryParams.valor_min.toString());
            if (queryParams.valor_max) searchParams.append('valor_max', queryParams.valor_max.toString());
            if (queryParams.orderBy) searchParams.append('order_by', queryParams.orderBy);
            if (queryParams.orderDirection) searchParams.append('order_direction', queryParams.orderDirection);

            const token = localStorage.getItem('auth_token');
            const timestamp = Date.now();
            const url = `/api/orcamentos?${searchParams.toString()}&_=${timestamp}`;

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

            const result = await response.json();


// Extrair dados corretamente
            const apiData = result.data || result; // Pega o 'data' da resposta

            setOrcamentos(apiData.orcamentos || []);
            setMeta(apiData.pagination ? {
                current_page: apiData.pagination.current_page,
                last_page: apiData.pagination.total_pages,
                per_page: apiData.pagination.items_per_page,
                total: apiData.pagination.total_items
            } : null);
            setSummary(apiData.summary || null);


        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);

            toast({
                title: 'Erro ao carregar orçamentos',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [currentParams, toast]);

    // Função para recarregar com os mesmos parâmetros
    const refetch = useCallback(async () => {
        await fetchOrcamentos(currentParams);
    }, [fetchOrcamentos, currentParams]);

    // Criar orçamento - TIPO MAIS FLEXÍVEL E PROTEÇÃO CONTRA ARRAY UNDEFINED
    const createOrcamento = useCallback(async (orcamentoData: any): Promise<Orcamento | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/orcamentos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orcamentoData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Erro ${response.status}`;

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
            }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            const newOrcamento = result.data;

            // PROTEÇÃO CONTRA ARRAY UNDEFINED - USAR CALLBACK FUNCTION
            setOrcamentos(prevOrcamentos => {
                const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                return [newOrcamento, ...currentArray];
            });

            toast({
                title: 'Orçamento criado',
                description: 'Orçamento criado com sucesso!',
            });

            return newOrcamento;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar orçamento';
            setError(errorMessage);

            toast({
                title: 'Erro ao criar orçamento',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);


    // Atualizar orçamento - COM PROTEÇÃO
    const updateOrcamento = useCallback(async (
        id: number,
        orcamentoData: Partial<Orcamento>
    ): Promise<Orcamento | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orcamentoData),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const updatedOrcamento = result.data;

            // PROTEÇÃO CONTRA ARRAY UNDEFINED
            setOrcamentos(prevOrcamentos => {
                const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                return currentArray.map(orcamento =>
                    orcamento.id === id ? updatedOrcamento : orcamento
                );
            });

            toast({
                title: 'Orçamento atualizado',
                description: 'Orçamento atualizado com sucesso!',
            });

            return updatedOrcamento;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar orçamento';
            setError(errorMessage);

            toast({
                title: 'Erro ao atualizar orçamento',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Excluir orçamento - COM PROTEÇÃO
    const deleteOrcamento = useCallback(async (id: number): Promise<boolean> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            // PROTEÇÃO CONTRA ARRAY UNDEFINED
            setOrcamentos(prevOrcamentos => {
                const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                return currentArray.filter(orcamento => orcamento.id !== id);
            });

            toast({
                title: 'Orçamento excluído',
                description: 'Orçamento excluído com sucesso!',
            });

            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir orçamento';
            setError(errorMessage);

            toast({
                title: 'Erro ao excluir orçamento',
                description: errorMessage,
                variant: 'destructive',
            });

            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Duplicar orçamento - COM PROTEÇÃO
    const duplicateOrcamento = useCallback(async (id: number): Promise<Orcamento | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const duplicatedOrcamento = result.data;

            // PROTEÇÃO CONTRA ARRAY UNDEFINED
            setOrcamentos(prevOrcamentos => {
                const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                return [duplicatedOrcamento, ...currentArray];
            });

            toast({
                title: 'Orçamento duplicado',
                description: 'Orçamento duplicado com sucesso!',
            });

            return duplicatedOrcamento;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar orçamento';
            setError(errorMessage);

            toast({
                title: 'Erro ao duplicar orçamento',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Alterar status - COM PROTEÇÃO
    const changeStatus = useCallback(async (
        id: number,
        status: Orcamento['status']
    ): Promise<Orcamento | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const updatedOrcamento = result.data;

            // PROTEÇÃO CONTRA ARRAY UNDEFINED
            setOrcamentos(prevOrcamentos => {
                const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                return currentArray.map(orcamento =>
                    orcamento.id === id ? updatedOrcamento : orcamento
                );
            });

            toast({
                title: 'Status atualizado',
                description: `Status alterado para ${status}`,
            });

            return updatedOrcamento;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status';
            setError(errorMessage);

            toast({
                title: 'Erro ao alterar status',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Enviar orçamento por email - COM PROTEÇÃO
    const sendOrcamento = useCallback(async (id: number, email?: string): Promise<boolean> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            toast({
                title: 'Orçamento enviado',
                description: 'Orçamento enviado por email com sucesso!',
            });

            // PROTEÇÃO CONTRA ARRAY UNDEFINED
            const currentOrcamentos = Array.isArray(orcamentos) ? orcamentos : [];
            const orcamento = currentOrcamentos.find(o => o.id === id);

            if (orcamento && orcamento.status === 'rascunho') {
                setOrcamentos(prevOrcamentos => {
                    const currentArray = Array.isArray(prevOrcamentos) ? prevOrcamentos : [];
                    return currentArray.map(o =>
                        o.id === id ? { ...o, status: 'enviado' as const } : o
                    );
                });
            }

            return true;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar orçamento';
            setError(errorMessage);

            toast({
                title: 'Erro ao enviar orçamento',
                description: errorMessage,
                variant: 'destructive',
            });

            return false;
        } finally {
            setLoading(false);
        }
    }, [toast, orcamentos]);

    // Gerar PDF
    const generatePDF = useCallback(async (id: number): Promise<Blob | null> => {
        try {
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/orcamentos/${id}/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            toast({
                title: 'PDF gerado',
                description: 'PDF do orçamento gerado com sucesso!',
            });

            return blob;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar PDF';
            setError(errorMessage);

            toast({
                title: 'Erro ao gerar PDF',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Buscar orçamento por ID - COM PROTEÇÃO
    const findOrcamentoById = useCallback((id: number): Orcamento | undefined => {
        const currentArray = Array.isArray(orcamentos) ? orcamentos : [];
        return currentArray.find(orcamento => orcamento.id === id);
    }, [orcamentos]);

    // Busca por termo
    const searchOrcamentos = useCallback((term: string) => {
        fetchOrcamentos({ ...currentParams, search: term, page: 1 });
    }, [fetchOrcamentos, currentParams]);

    // Filtrar por status
    const filterByStatus = useCallback((status: Orcamento['status'] | 'all') => {
        fetchOrcamentos({ ...currentParams, status, page: 1 });
    }, [fetchOrcamentos, currentParams]);

    // Filtrar por cliente
    const filterByCliente = useCallback((clienteId: number | null) => {
        fetchOrcamentos({
            ...currentParams,
            cliente_id: clienteId || undefined,
            page: 1
        });
    }, [fetchOrcamentos, currentParams]);

    // Carregar dados iniciais - COM DELAY PARA EVITAR CHAMADAS MUITO RÁPIDAS
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrcamentos();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return {
        // Dados
        data: {
            orcamentos: Array.isArray(orcamentos) ? orcamentos : [],
            pagination: meta ? {
                current_page: meta.current_page,
                total_pages: meta.last_page,
                total_items: meta.total,
                items_per_page: meta.per_page
            } : null
        },
        isLoading: loading,
        error,
        refetch,

        orcamentos: Array.isArray(orcamentos) ? orcamentos : [],
        meta,
        summary,

        // Estados
        loading,
        error,

        // Ações CRUD
        refetch,
        fetchOrcamentos,
        createOrcamento,
        updateOrcamento,
        deleteOrcamento,

        // Ações específicas
        duplicateOrcamento,
        changeStatus,
        sendOrcamento,
        generatePDF,

        // Utilitários
        findOrcamentoById,
        searchOrcamentos,
        filterByStatus,
        filterByCliente,
    };
};