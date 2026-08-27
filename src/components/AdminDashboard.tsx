import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Globe,
  FolderHeart,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Activity,
  Server,
  Zap,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { Voice, UserAccount, PlatformStats, VoiceCategory, VoiceGender } from '../types';
import { API } from '../services/api';

interface AdminDashboardProps {
  voices: Voice[];
  users: UserAccount[];
  stats: PlatformStats;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  voices,
  users,
  stats,
  onRefreshData,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'public_library' | 'user_voices' | 'users' | 'telemetry'>('public_library');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Public Voice Modal State
  const [showAddVoiceModal, setShowAddVoiceModal] = useState(false);
  const [newVoiceName, setNewVoiceName] = useState('');
  const [newVoiceDesc, setNewVoiceDesc] = useState('');
  const [newVoiceCategory, setNewVoiceCategory] = useState<VoiceCategory>('Professional');
  const [newVoiceGender, setNewVoiceGender] = useState<VoiceGender>('Female');
  const [newVoiceAccent, setNewVoiceAccent] = useState('Standard American');
  const [newVoiceAnchor, setNewVoiceAnchor] = useState('Kore');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Voice Modal State
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);

  // Audio Preview State
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [previewAudioElement, setPreviewAudioElement] = useState<HTMLAudioElement | null>(null);

  const togglePreview = (voice: Voice) => {
    if (!voice.previewAudioUrl) return;

    if (playingPreviewId === voice.id && previewAudioElement) {
      previewAudioElement.pause();
      setPlayingPreviewId(null);
    } else {
      if (previewAudioElement) previewAudioElement.pause();
      const audio = new Audio(voice.previewAudioUrl);
      audio.onended = () => setPlayingPreviewId(null);
      audio.play().then(() => {
        setPreviewAudioElement(audio);
        setPlayingPreviewId(voice.id);
      }).catch(err => console.warn(err));
    }
  };

  // Toggle Voice Public / Disabled Status
  const handleToggleStatus = async (voice: Voice, newStatus: 'Public' | 'Disabled' | 'Private') => {
    try {
      await API.updateVoiceStatus(voice.id, newStatus, newStatus === 'Public');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // Promote User Voice to Public Library
  const handlePromoteToPublic = async (voice: Voice) => {
    try {
      await API.updateVoiceStatus(voice.id, 'Public', true);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to promote voice');
    }
  };

  // Delete Voice
  const handleDeleteVoice = async (voice: Voice) => {
    if (confirm(`Are you sure you want to permanently delete "${voice.name}"?`)) {
      try {
        await API.deleteVoice(voice.id);
        onRefreshData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete voice');
      }
    }
  };

  // Handle Add Public Voice
  const handleCreatePublicVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoiceName || !newVoiceDesc) return;

    setIsSubmitting(true);
    try {
      await API.addPublicVoice({
        name: newVoiceName,
        description: newVoiceDesc,
        category: newVoiceCategory,
        gender: newVoiceGender,
        accent: newVoiceAccent,
        baseAnchor: newVoiceAnchor,
        tags: [newVoiceCategory, newVoiceAccent, 'Studio Master'],
      });

      setShowAddVoiceModal(false);
      setNewVoiceName('');
      setNewVoiceDesc('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add public voice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Voice Submit
  const handleSaveEditedVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoice) return;

    try {
      await API.updateVoice(editingVoice.id, {
        name: editingVoice.name,
        description: editingVoice.description,
        category: editingVoice.category,
        gender: editingVoice.gender,
      });
      setEditingVoice(null);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save voice changes');
    }
  };

  const publicVoices = voices.filter((v) => v.isPublic && v.status !== 'Deleted');
  const userCreatedVoices = voices.filter((v) => !v.isPublic && v.status !== 'Deleted');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1917] border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Platform Management & Voice Moderation
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-1 max-w-xl">
            Oversee public studio voices, moderate and promote user-cloned voices, monitor real-time speech synthesis telemetry, and manage registered accounts.
          </p>
        </div>

        <button
          id="admin-add-voice-btn"
          type="button"
          onClick={() => setShowAddVoiceModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Public Studio Voice</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Total Generations</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-serif">
            {stats.totalGenerations.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
            +14% this week
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Public Voice Library</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-serif">
            {publicVoices.length}
          </div>
          <span className="text-[10px] text-[#737373] mt-1 inline-block">
            Active in library
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">User Cloned Voices</span>
            <FolderHeart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-serif">
            {userCreatedVoices.length}
          </div>
          <span className="text-[10px] text-amber-400 font-semibold mt-1 inline-block">
            Ready for promotion
          </span>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#737373] mb-2">
            <span className="text-xs font-semibold">Avg TTS Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.avgLatencyMs}ms
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
            Status: {stats.systemStatus}
          </span>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              id="admin-tab-public"
              type="button"
              onClick={() => setActiveAdminTab('public_library')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeAdminTab === 'public_library'
                  ? 'bg-[#242424] text-amber-400 border border-[#3a3a3a] shadow-xs'
                  : 'bg-[#181818] text-[#8e8e8e] hover:text-white border border-[#262626]'
              }`}
            >
              Public Voice Library ({publicVoices.length})
            </button>

            <button
              id="admin-tab-user-voices"
              type="button"
              onClick={() => setActiveAdminTab('user_voices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeAdminTab === 'user_voices'
                  ? 'bg-[#242424] text-amber-400 border border-[#3a3a3a] shadow-xs'
                  : 'bg-[#181818] text-[#8e8e8e] hover:text-white border border-[#262626]'
              }`}
            >
              User-Created Voices ({userCreatedVoices.length})
            </button>

            <button
              id="admin-tab-users"
              type="button"
              onClick={() => setActiveAdminTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeAdminTab === 'users'
                  ? 'bg-[#242424] text-amber-400 border border-[#3a3a3a] shadow-xs'
                  : 'bg-[#181818] text-[#8e8e8e] hover:text-white border border-[#262626]'
              }`}
            >
              Registered Users ({users.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-xs text-[#f0f0f0] placeholder-[#737373] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
            />
          </div>
        </div>

        {/* TAB 1: Public Voice Library Management */}
        {activeAdminTab === 'public_library' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#737373] font-semibold uppercase tracking-wider">
                  <th className="pb-3">Voice Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Gender / Accent</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Usage</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {publicVoices
                  .filter((v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((voice) => (
                    <tr key={voice.id} className="hover:bg-[#181818]/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-white flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => togglePreview(voice)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            playingPreviewId === voice.id
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                              : 'bg-[#222222] border border-[#333333] text-amber-400 hover:text-white'
                          }`}
                          title="Preview voice"
                        >
                          {playingPreviewId === voice.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="font-serif">{voice.name}</div>
                          <div className="text-[10px] text-[#737373] font-normal line-clamp-1">
                            {voice.description}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-[#a3a3a3]">
                        <span className="px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] text-[10px] font-semibold text-[#d4d4d4]">
                          {voice.category}
                        </span>
                      </td>

                      <td className="py-3.5 text-[#a3a3a3]">
                        {voice.gender} • {voice.acousticProfile?.accent || 'Natural'}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            voice.status === 'Public'
                              ? 'bg-[#13231b] border border-emerald-800/40 text-emerald-300'
                              : 'bg-[#251b14] border border-amber-800/40 text-amber-300'
                          }`}
                        >
                          {voice.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-[#a3a3a3] font-mono">
                        {voice.useCount || 0} calls
                      </td>

                      <td className="py-3.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setEditingVoice(voice)}
                          className="p-1.5 text-[#737373] hover:text-amber-400 rounded-md transition-colors"
                          title="Edit Voice Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              voice,
                              voice.status === 'Public' ? 'Disabled' : 'Public'
                            )
                          }
                          className="p-1.5 text-[#737373] hover:text-amber-400 rounded-md transition-colors"
                          title={voice.status === 'Public' ? 'Disable Voice' : 'Enable Voice'}
                        >
                          {voice.status === 'Public' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVoice(voice)}
                          className="p-1.5 text-[#737373] hover:text-red-400 rounded-md transition-colors"
                          title="Delete Voice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: User-Created Voices Review Hub */}
        {activeAdminTab === 'user_voices' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1814] border border-amber-800/40 rounded-2xl text-xs text-[#d4d4d4] flex items-start gap-3">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="text-amber-400">Voice Promotion Pipeline:</strong> Review audio samples and acoustic fidelity of user-cloned voices. Clicking <strong>"Publish to Public Library"</strong> promotes the voice to the global directory for all users.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#737373] font-semibold uppercase tracking-wider">
                    <th className="pb-3">Cloned Voice</th>
                    <th className="pb-3">Created By</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {userCreatedVoices
                    .filter((v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.createdBy.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((voice) => (
                      <tr key={voice.id} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-white flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => togglePreview(voice)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              playingPreviewId === voice.id
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                                : 'bg-[#222222] border border-[#333333] text-amber-400 hover:text-white'
                            }`}
                            title="Preview cloned voice"
                          >
                            {playingPreviewId === voice.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>
                          <div>
                            <div className="font-serif">{voice.name}</div>
                            <div className="text-[10px] text-[#737373] font-normal">
                              {voice.gender} • {voice.category}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-[#d4d4d4]">
                          <div className="font-medium text-white">
                            {voice.creatorName || voice.createdBy}
                          </div>
                          <div className="text-[10px] text-[#737373]">{voice.createdBy}</div>
                        </td>

                        <td className="py-3.5 text-[#8e8e8e]">
                          {new Date(voice.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#251b14] border border-amber-800/40 text-amber-300 text-[10px] font-bold">
                            {voice.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-right space-x-2">
                          <button
                            id={`promote-btn-${voice.id}`}
                            type="button"
                            onClick={() => handlePromoteToPublic(voice)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-xs inline-flex items-center gap-1 border border-emerald-500/30"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Publish to Library</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVoice(voice)}
                            className="p-1.5 text-[#737373] hover:text-red-400 rounded-md transition-colors"
                            title="Delete user voice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Registered Users */}
        {activeAdminTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222222] text-[#737373] font-semibold uppercase tracking-wider">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Cloned Voices</th>
                  <th className="pb-3">TTS Generations</th>
                  <th className="pb-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181818]/60 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#242424] border border-[#333333] text-amber-400 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-[#737373] font-normal">{u.email}</div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-[#1c1917] border border-amber-800/40 text-amber-300'
                            : 'bg-[#1e1e1e] border border-[#2e2e2e] text-[#a3a3a3]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 text-[#d4d4d4] font-mono">
                      {u.voicesCount} voices
                    </td>

                    <td className="py-3.5 text-[#d4d4d4] font-mono">
                      {u.generationsCount} runs
                    </td>

                    <td className="py-3.5 text-[#737373]">
                      {new Date(u.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Public Studio Voice */}
      {showAddVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-white">
              Add Voice to Public Library
            </h3>
            <form onSubmit={handleCreatePublicVoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                  Voice Name
                </label>
                <input
                  type="text"
                  required
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="e.g. Gabriel Stone"
                  className="w-full text-xs p-2.5 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                  Voice Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={newVoiceDesc}
                  onChange={(e) => setNewVoiceDesc(e.target.value)}
                  placeholder="e.g. Deep, authoritative cinematic trailer voice with rich resonance."
                  className="w-full text-xs p-2.5 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                    Gender
                  </label>
                  <select
                    value={newVoiceGender}
                    onChange={(e) => setNewVoiceGender(e.target.value as VoiceGender)}
                    className="w-full text-xs p-2 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                    Category
                  </label>
                  <select
                    value={newVoiceCategory}
                    onChange={(e) => setNewVoiceCategory(e.target.value as VoiceCategory)}
                    className="w-full text-xs p-2 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                  >
                    <option value="Narration">Narration</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Professional">Professional</option>
                    <option value="Character">Character</option>
                    <option value="News">News</option>
                    <option value="Meditation">Meditation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                    Accent / Style
                  </label>
                  <input
                    type="text"
                    value={newVoiceAccent}
                    onChange={(e) => setNewVoiceAccent(e.target.value)}
                    placeholder="e.g. British RP, Mid-Atlantic"
                    className="w-full text-xs p-2.5 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                    Neural Base Anchor
                  </label>
                  <select
                    value={newVoiceAnchor}
                    onChange={(e) => setNewVoiceAnchor(e.target.value)}
                    className="w-full text-xs p-2 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                  >
                    <option value="Kore">Kore (Warm Female)</option>
                    <option value="Zephyr">Zephyr (Bright Female)</option>
                    <option value="Aoede">Aoede (Lyrical Female)</option>
                    <option value="Fenrir">Fenrir (Deep Male)</option>
                    <option value="Charon">Charon (Refined Male)</option>
                    <option value="Puck">Puck (Energetic Male)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVoiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#8e8e8e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md border border-amber-500/30"
                >
                  {isSubmitting ? 'Synthesizing...' : 'Publish to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Voice Details */}
      {editingVoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-white">
              Edit Voice Details
            </h3>
            <form onSubmit={handleSaveEditedVoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                  Voice Name
                </label>
                <input
                  type="text"
                  required
                  value={editingVoice.name}
                  onChange={(e) => setEditingVoice({ ...editingVoice, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingVoice.description}
                  onChange={(e) =>
                    setEditingVoice({ ...editingVoice, description: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-[#1a1a1a] border border-[#2e2e2e] text-[#f0f0f0] rounded-xl focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVoice(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#8e8e8e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl border border-amber-500/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
