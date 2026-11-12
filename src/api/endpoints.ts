import { apiRequest, setStoredTokens, clearStoredTokens } from './client';

export const authApi = {
  login: async (phone: string, password: string) => {
    const res = await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    if (res.accessToken) {
      setStoredTokens(res.accessToken, res.refreshToken);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      clearStoredTokens();
    }
  },

  getMe: async () => {
    return apiRequest('/api/v1/auth/me');
  },
};

export const plotsApi = {
  list: async () => {
    return apiRequest('/api/v1/plots');
  },

  get: async (plotId: string) => {
    return apiRequest(`/api/v1/plots/${plotId}`);
  },

  register: async (data: {
    farmerName: string;
    phone: string;
    passbookNo: string;
    coordinates: [number, number][];
    idempotencyKey?: string;
  }) => {
    const headers: Record<string, string> = {};
    if (data.idempotencyKey) {
      headers['X-Idempotency-Key'] = data.idempotencyKey;
    }
    return apiRequest('/api/v1/plots/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },
};

export const evidenceApi = {
  upload: async (formData: FormData, idempotencyKey?: string) => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return apiRequest('/api/v1/evidence/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
  },
};

export const auditApi = {
  getChain: async () => {
    return apiRequest('/api/v1/audit/chain');
  },

  verify: async () => {
    return apiRequest('/api/v1/audit/verify');
  },
};

export const adminApi = {
  unlockAccount: async (phone: string) => {
    return apiRequest('/api/v1/admin/unlock-account', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  resetDemo: async () => {
    return apiRequest('/api/v1/admin/reset-demo', {
      method: 'POST',
    });
  },

  getConsoleData: async () => {
    return apiRequest('/api/v1/admin/console-data');
  },
};

export const systemApi = {
  getHealth: async () => {
    return apiRequest('/health');
  },

  getReadiness: async () => {
    return apiRequest('/ready');
  },
};
