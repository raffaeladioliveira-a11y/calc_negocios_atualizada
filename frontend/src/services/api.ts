import axios from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Cliente {
  id: number;
  name: string;
  email: string;
  phone?: string;
  empresa?: string;
  cargo?: string;
  status: 'Ativo' | 'Inativo';
  calculations: number;
  avatar?: string;
  last_activity?: string;
  created_at: string;
  updated_at: string;
  valor: number; // Valor por hora
}

export interface ClienteFormData {
  name: string;
  email: string;
  phone?: string;
  empresa?: string;
  cargo?: string;
  valor: number;
}

export interface Orcamento {
  id: number;
  cliente_id: number;
  titulo: string;
  descricao?: string;
  valor_total: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Em Andamento';
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
}

export interface OrcamentoFormData {
  cliente_id: number;
  titulo: string;
  descricao?: string;
  valor_total: number;
}

export interface CalcValores {
  valor_hora_base: number;
  margem_lucro: number;
  custo_operacional: number;
  desconto_maximo: number;
}

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  media_calculos: number;
}

// API Functions
export const clientesApi = {
  // Get all clients with optional search
  getAll: async (search?: string): Promise<Cliente[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/clientes', { params });
    return response.data.data || response.data;
  },

  // Get client by ID
  getById: async (id: number): Promise<Cliente> => {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data || response.data;
  },

  // Create new client
  create: async (data: ClienteFormData): Promise<Cliente> => {
    const response = await api.post('/clientes', data);
    return response.data.data || response.data;
  },

  // Update client
  update: async (id: number, data: Partial<ClienteFormData>): Promise<Cliente> => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete client
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },

  // Get client statistics
  getStats: async (): Promise<ClienteStats> => {
    const response = await api.get('/clientes/stats');
    return response.data.data || response.data;
  },
};

export const orcamentosApi = {
  // Get all orcamentos
  getAll: async (): Promise<Orcamento[]> => {
    const response = await api.get('/orcamentos');
    return response.data.data || response.data;
  },

  // Get orcamento by ID
  getById: async (id: number): Promise<Orcamento> => {
    const response = await api.get(`/orcamentos/${id}`);
    return response.data.data || response.data;
  },

  // Create new orcamento
  create: async (data: OrcamentoFormData): Promise<Orcamento> => {
    const response = await api.post('/orcamentos', data);
    return response.data.data || response.data;
  },

  // Update orcamento
  update: async (id: number, data: Partial<OrcamentoFormData>): Promise<Orcamento> => {
    const response = await api.put(`/orcamentos/${id}`, data);
    return response.data.data || response.data;
  },

  // Update orcamento status
  updateStatus: async (id: number, status: string): Promise<Orcamento> => {
    const response = await api.put(`/orcamentos/${id}/status`, { status });
    return response.data.data || response.data;
  },

  // Delete orcamento
  delete: async (id: number): Promise<void> => {
    await api.delete(`/orcamentos/${id}`);
  },

  // Get orcamento statistics
  getStats: async () => {
    const response = await api.get('/orcamentos/stats');
    return response.data.data || response.data;
  },
};

export const calcValoresApi = {
  // Get calculation configuration
  getConfiguracoes: async (): Promise<CalcValores> => {
    const response = await api.get('/calc-valores');
    return response.data.data || response.data;
  },

  // Update calculation configuration
  updateConfiguracoes: async (data: Partial<CalcValores>): Promise<CalcValores> => {
    const response = await api.put('/calc-valores', data);
    return response.data.data || response.data;
  },
};

export default api;