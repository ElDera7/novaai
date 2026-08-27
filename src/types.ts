export type VoiceStatus = 'Processing' | 'Private' | 'Public' | 'Disabled' | 'Deleted';

export type VoiceGender = 'Male' | 'Female' | 'Neutral';

export type VoiceCategory = 'Narration' | 'Conversational' | 'Professional' | 'Character' | 'News' | 'Meditation' | 'Custom';

export interface AcousticProfile {
  pitch: number; // -10 to +10
  speed: number; // 0.5 to 2.0
  timbre: string; // e.g. 'Warm', 'Resonant', 'Crisp', 'Deep', 'Bright'
  baseAnchor: string; // 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Aoede'
  accent: string;
  sampleRate: number;
  clarityScore?: number;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
  category: VoiceCategory;
  gender: VoiceGender;
  tags: string[];
  status: VoiceStatus;
  isPublic: boolean;
  createdBy: string; // User email or 'System / Admin'
  creatorName: string;
  createdAt: string;
  previewAudioUrl?: string; // base64 data URL or relative URL
  sampleAudioDurationSec?: number;
  acousticProfile: AcousticProfile;
  useCount?: number;
}

export interface GenerationHistoryItem {
  id: string;
  userId: string;
  voiceId: string;
  voiceName: string;
  voiceGender: VoiceGender;
  text: string;
  audioUrl: string; // base64 wav data URL
  durationSeconds: number;
  createdAt: string;
  speed: number;
  pitch: number;
  emotion: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  generationsCount: number;
  voicesCount: number;
  lastActive: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserAccount;
  token?: string;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'user';
}

export interface PlatformStats {
  totalGenerations: number;
  totalAudioSeconds: number;
  publicVoicesCount: number;
  userVoicesCount: number;
  totalUsers: number;
  avgLatencyMs: number;
  systemStatus: 'Optimal' | 'Degraded' | 'Offline';
}

export interface TTSRequest {
  voiceId: string;
  text: string;
  speed?: number;
  pitch?: number;
  emotion?: 'Neutral' | 'Cheerful' | 'Authoritative' | 'Whispering' | 'Dramatic' | 'Conversational' | 'Energetic';
  userId?: string;
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  gender?: VoiceGender;
  category?: VoiceCategory;
  audioBase64: string; // audio data
  audioMimeType?: string;
  audioDuration?: number;
  userId: string;
  creatorName: string;
}
