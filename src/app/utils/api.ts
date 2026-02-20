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

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:5000';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
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

  return result.data;
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

export const exportToCSV = async (token: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao exportar dados');
  }

  return response.blob();
};
