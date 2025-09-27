/**
 * Created by rafaela on 24/09/25.
 */
// Em: frontend/src/services/api.ts (CRIAR ESSE ARQUIVO)
const API_BASE_URL = '/api';

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
}

export interface ClienteCalculadora {
    id: string;
    nome: string;
    empresa?: string;
    valor: number;
}

// Interface completa para gerenciamento de clientes
export interface Cliente {
    id: number;
    name: string;
    email: string;
    phone?: string;
    empresa?: string;
    cargo?: string;
    status: 'Ativo' | 'Inativo';
    calculations: number;
    avatar: string;
    last_activity?: string;
    created_at?: string;
    updated_at?: string;
    valor?: number;
}

class ApiService {
    private async request(endpoint: string, options: RequestInit = {}) {
        try {
            // CORRIGIDO: usar 'auth_token' que é o que o AuthContext salva
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    // CORRIGIDO: formato correto do header Authorization
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                // MELHORADO: tratar diferentes códigos de erro
                if (response.status === 401) {
                    // Token inválido ou expirado - redirecionar para login
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    window.location.href = '/login';
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Erro na requisição API:', error);
            throw error;
        }
    }

    // Configurações de valores
    async getConfiguracoes(): Promise<CalcValores> {
        try {
            const result = await this.request('/calc-valores');
            if (!result.data) {
                throw new Error('Dados de configuração não encontrados na resposta');
            }

            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async updateConfiguracoes(dados: Partial<CalcValores>): Promise<CalcValores> {
        const result = await this.request('/calc-valores', {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
        return result.data;
    }

    async resetConfiguracoes(): Promise<CalcValores> {
        const result = await this.request('/calc-valores/reset', {
            method: 'POST',
        });
        return result.data;
    }

    // Clientes para calculadora
    async getClientesCalculadora(): Promise<ClienteCalculadora[]> {
        const result = await this.request('/clientes/calculadora');
        return result.data;
    }

    // Clientes para gerenciamento
    async getClientes(search?: string): Promise<Cliente[]> {
        const endpoint = search ? `/clientes?search=${encodeURIComponent(search)}` : '/clientes';
        const result = await this.request(endpoint);
        return result.data;
    }
}

export const apiService = new ApiService();