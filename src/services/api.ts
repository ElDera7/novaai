import { Voice, GenerationHistoryItem, UserAccount, PlatformStats, TTSRequest, VoiceCloneRequest, AuthResponse, LoginPayload, RegisterPayload } from '../types';

// In-memory or localStorage token / active email store
let currentUserEmail: string | null = null;

export const setApiUserEmail = (email: string | null) => {
  currentUserEmail = email;
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentUserEmail) {
    headers['x-user-email'] = currentUserEmail;
  }
  return headers;
};

export const API = {
  // Auth
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.user?.email) {
      setApiUserEmail(data.user.email);
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.user?.email) {
      setApiUserEmail(data.user.email);
    }
    return data;
  },

  async getMe(): Promise<{ user: UserAccount }> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Stats
  async getStats(): Promise<PlatformStats> {
    const res = await fetch('/api/stats', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Health
  async getHealth(): Promise<any> {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Voices
  async getVoices(params?: { category?: string; search?: string; userId?: string; scope?: string; status?: string }): Promise<Voice[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.scope) query.append('scope', params.scope);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`/api/voices?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load voices');
    return res.json();
  },

  async getVoice(id: string): Promise<Voice> {
    const res = await fetch(`/api/voices/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch voice');
    return res.json();
  },

  // Clone Voice
  async cloneVoice(payload: VoiceCloneRequest): Promise<{ success: boolean; voice: Voice; message: string }> {
    const res = await fetch('/api/voices/clone', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Voice cloning failed');
    return data;
  },

  // Update Voice Details
  async updateVoice(id: string, updates: Partial<Voice>): Promise<{ success: boolean; voice: Voice }> {
    const res = await fetch(`/api/voices/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update voice');
    return data;
  },

  // Change Voice Status (Admin / Promote)
  async updateVoiceStatus(id: string, status: string, isPublic?: boolean): Promise<{ success: boolean; voice: Voice }> {
    const res = await fetch(`/api/voices/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, isPublic }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update voice status');
    return data;
  },

  // Delete Voice
  async deleteVoice(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/voices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete voice');
    return data;
  },

  // Text-To-Speech Generation
  async generateSpeech(payload: TTSRequest): Promise<{
    success: boolean;
    audioUrl: string;
    durationSeconds: number;
    historyItem: GenerationHistoryItem;
    cached: boolean;
    latencyMs: number;
  }> {
    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Speech generation failed');
    return data;
  },

  // Generation History
  async getHistory(userId?: string): Promise<GenerationHistoryItem[]> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/history${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async deleteHistoryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete history item');
    return data;
  },

  // Admin APIs (requires admin role)
  async getAdminUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch admin users');
    }
    return res.json();
  },

  async addPublicVoice(voiceData: any): Promise<{ success: boolean; voice: Voice }> {
    const res = await fetch('/api/admin/voices/add', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(voiceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add public voice');
    return data;
  },
};
