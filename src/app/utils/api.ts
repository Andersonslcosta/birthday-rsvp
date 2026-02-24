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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

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
    body: JSON.stringify({ password }),
  });

  return { token: result.token };
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
