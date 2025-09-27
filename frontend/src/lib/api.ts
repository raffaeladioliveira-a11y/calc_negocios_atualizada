/**
 * Created by rafaela on 27/09/25.
 */
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

// Cliente HTTP básico com token
export const apiClient = {
    get: async (url: string) => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        return response;
    },

    post: async (url: string, data: any) => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response;
    },

    // Adicione PUT, DELETE conforme necessário
};