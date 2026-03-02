/**
 * CAMADA DE API (FRONTEND ↔ BACKEND)
 * 
 * Responsável por:
 * - Centralizar todas as requisições HTTP
 * - Gerenciar autenticação (Access Token + Refresh Token)
 * - Auto-refresh de token quando expire
 * - Handling de erros padronizado
 * - Logging de requisições
 * 
 * Conecta com:
 * - AdminPanel.tsx (getGuests, deleteRSVP, etc)
 * - InvitePage.tsx (createRSVP)
 * - ForgotPassword.tsx (requestPasswordReset)
 * - ResetPassword.tsx (validateResetToken, resetPassword)
 * - storage.ts (gerencia access tokens em sessionStorage)
 * 
 * Backend:
 * - Todas as rotas em server/src/routes.ts
 */

import { saveAccessToken, getAccessToken, clearTokens, shouldRefreshToken } from './storage.js';

export interface Participant {
  name: string;
  age: number | null;
  isChild: boolean;
}

export interface Guest {
  id: string;
  responsibleName: string;
  confirmation: 'sim' | 'nao';
  totalPeople: number;
  participants: Participant[];
  timestamp: string;
}

export interface RsvpPayload {
  responsibleName: string;
  confirmation: 'sim' | 'nao';
  totalPeople: number;
  participants: Participant[];
}

// In development, use relative paths to leverage Vite proxy
// In production, use the full API URL from environment
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

console.log('[API] Development mode:', import.meta.env.DEV);
console.log('[API] Configured API_BASE_URL:', API_BASE_URL);
console.log('[API] Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

// Fix common mojibake when Latin-1 bytes were decoded as UTF-8 (e.g., JoÃ£o -> João)
const fixMojibake = (value: string): string => {
  if (!value) return value;
  const normalized = value.normalize('NFC');
  if (!/[ÃÂ]/.test(normalized)) {
    return normalized;
  }

  try {
    const bytes = Uint8Array.from(normalized, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return decoded.normalize('NFC');
  } catch {
    return normalized;
  }
};

const normalizeGuest = (guest: Guest): Guest => ({
  ...guest,
  responsibleName: fixMojibake(guest.responsibleName),
  participants: guest.participants.map((participant) => ({
    ...participant,
    name: fixMojibake(participant.name),
  })),
});

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  console.log(`[API] Fetching: ${API_BASE_URL}${endpoint}`, options.method || 'GET');
  
  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Enviar cookies (refresh token)
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Se 401 e temos access token, tentar fazer refresh
    if (response.status === 401 && getAccessToken()) {
      console.log('[API] Token expirou, tentando refresh...');
      
      try {
        await refreshAccessTokenRequest();
        
        // Tentar novamente com novo token
        const newToken = getAccessToken();
        if (newToken) {
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
              ...options.headers,
            },
            ...options,
          });
        }
      } catch (refreshError) {
        console.error('[API] Refresh falhou:', refreshError);
        clearTokens();
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error(`[API] Error ${response.status}:`, data);
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[API] Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Refresh access token usando refresh token (em HTTP-only cookie)
 */
async function refreshAccessTokenRequest(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/refresh`, {
    method: 'POST',
    credentials: 'include', // Incluir refresh token cookie
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao renovar token');
  }

  const data = await response.json();
  
  if (data.token) {
    saveAccessToken(data.token, data.expiresIn || 900);
    return data.token;
  }

  throw new Error('Nenhum token retornado');
}

export const saveRSVP = async (guest: Omit<Guest, 'id' | 'timestamp'>): Promise<Guest> => {
  const payload = {
    responsibleName: guest.responsibleName,
    confirmation: guest.confirmation,
    totalPeople: guest.totalPeople,
    participants: guest.participants.map((p) => ({
      name: p.name,
      age: p.age === null ? null : p.age,
      isChild: p.isChild,
    })),
  };

  const result = await apiFetch('/api/rsvp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result.data;
};

export const getGuests = async (token: string): Promise<Guest[]> => {
  const result = await apiFetch('/api/rsvp', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.map(normalizeGuest);
};

export const getStatistics = async (
  token: string
): Promise<{
  totalGuests: number;
  confirmed: number;
  declined: number;
  totalConfirmed: number;
  adults: number;
  children: number;
}> => {
  const result = await apiFetch('/api/statistics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data;
};

export const adminLogin = async (password: string): Promise<{ token: string }> => {
  const result = await apiFetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include', // Para receber refresh token em cookie
    body: JSON.stringify({ password }),
  });

  // Salvar access token com tempo de expiração
  if (result.token && result.expiresIn) {
    saveAccessToken(result.token, result.expiresIn);
  }

  return { token: result.token };
};

/**
 * Logout - revoga tokens no servidor
 */
export const adminLogout = async (token: string): Promise<void> => {
  try {
    await apiFetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.warn('[API] Erro ao fazer logout no servidor:', error);
  } finally {
    // Sempre limpar tokens localmente
    clearTokens();
  }
};

export const clearAllData = async (token: string): Promise<void> => {
  await apiFetch('/api/admin/rsvp', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteRSVP = async (token: string, id: string): Promise<void> => {
  const result = await apiFetch(`/api/admin/rsvp/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao deletar confirmação');
  }
};

export const deleteParticipant = async (token: string, rsvpId: string, participantName: string): Promise<void> => {
  const encodedName = encodeURIComponent(participantName);
  const result = await apiFetch(`/api/admin/rsvp/${rsvpId}/participant/${encodedName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao deletar participante');
  }
};

export const exportToCSV = async (token: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao exportar dados';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('Content-Type');
  if (!contentType || !contentType.includes('text/csv')) {
    throw new Error('Resposta inválida: esperado CSV');
  }

  return response.blob();
};

// Password Reset APIs
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  const result = await apiFetch('/api/admin/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result;
};

export const validateResetToken = async (token: string): Promise<{ success: boolean; message?: string }> => {
  const result = await apiFetch(`/api/admin/validate-reset-token/${token}`, {
    method: 'GET',
  });
  return result;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string; newPassword?: string }> => {
  const result = await apiFetch('/api/admin/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
  return result;
};
