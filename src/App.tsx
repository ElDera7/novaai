import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceLibraryView } from './components/VoiceLibraryView';
import { MyVoicesView } from './components/MyVoicesView';
import { TTSView } from './components/TTSView';
import { HistoryView } from './components/HistoryView';
import { AdminDashboard } from './components/AdminDashboard';
import { VoiceCloningModal } from './components/VoiceCloningModal';
import { Voice, GenerationHistoryItem, UserAccount, PlatformStats } from './types';
import { API } from './services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, X, Info } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'library' | 'my_voices' | 'tts' | 'history' | 'admin'>('library');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalGenerations: 124,
    totalAudioSeconds: 1840,
    publicVoicesCount: 7,
    userVoicesCount: 2,
    totalUsers: 4,
    avgLatencyMs: 840,
    systemStatus: 'Optimal',
  });

  // Current active user (default: Gideon Princewill from prompt)
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'user_gideon',
    email: 'gideonprincewill5@gmail.com',
    name: 'Gideon Princewill',
    role: 'user',
    createdAt: new Date().toISOString(),
    generationsCount: 14,
    voicesCount: 2,
    lastActive: new Date().toISOString(),
  });

  // Selected Voice for Text-To-Speech
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  // Text for TTS prompt (when reusing from history or presets)
  const [ttsInputText, setTtsInputText] = useState<string>('');

  // Voice Cloning Modal State
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Fetch
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedVoices, fetchedStats, fetchedUsers, fetchedHistory] = await Promise.all([
        API.getVoices(),
        API.getStats().catch(() => stats),
        API.getAdminUsers().catch(() => [currentUser]),
        API.getHistory(currentUser.email).catch(() => []),
      ]);

      setVoices(fetchedVoices);
      setStats(fetchedStats);
      setUsers(fetchedUsers);
      setHistory(fetchedHistory);

      // Set default selected voice if not set
      if (!selectedVoice && fetchedVoices.length > 0) {
        const defaultV = fetchedVoices.find((v) => v.isPublic) || fetchedVoices[0];
        setSelectedVoice(defaultV);
      }
    } catch (err) {
      console.error('Error initializing platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When user switches account, re-fetch history
  const handleSwitchUser = async (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Switched account to ${user.name}`, `Role: ${user.role}`, 'info');
    try {
      const userHistory = await API.getHistory(user.email);
      setHistory(userHistory);
    } catch (e) {
      console.warn(e);
    }
  };

  // Select Voice from Voice Library or My Voices -> Transitions directly to TTS
  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    setCurrentTab('tts');
    showToast(`Selected "${voice.name}"`, 'Ready for speech generation in Text to Speech tab.');
  };

  // Voice Created in Cloning Wizard
  const handleVoiceCreated = (newVoice: Voice) => {
    setVoices((prev) => [newVoice, ...prev]);
    setSelectedVoice(newVoice);
    setCurrentTab('tts');

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    showToast(
      `"${newVoice.name}" Cloned Successfully!`,
      'Your custom voice is now ready and selected for Text-to-Speech.'
    );
  };

  // Delete Voice Handler
  const handleDeleteVoice = async (voice: Voice) => {
    try {
      await API.deleteVoice(voice.id);
      setVoices((prev) => prev.filter((v) => v.id !== voice.id));
      if (selectedVoice?.id === voice.id) {
        const nextVoice = voices.find((v) => v.id !== voice.id && v.isPublic) || null;
        setSelectedVoice(nextVoice);
      }
      showToast('Voice Deleted', `"${voice.name}" has been removed.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete voice');
    }
  };

  // New Generation Completed -> Add to history state
  const handleGenerationComplete = (newItem: GenerationHistoryItem) => {
    setHistory((prev) => [newItem, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalGenerations: prev.totalGenerations + 1,
      totalAudioSeconds: prev.totalAudioSeconds + newItem.durationSeconds,
    }));
  };

  // Delete History Item
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await API.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast('Record Deleted', 'Generated audio record removed.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Reuse text from history in TTS
  const handleReuseText = (text: string, voiceId?: string) => {
    setTtsInputText(text);
    if (voiceId) {
      const matchVoice = voices.find((v) => v.id === voiceId);
      if (matchVoice) setSelectedVoice(matchVoice);
    }
    setCurrentTab('tts');
    showToast('Script Loaded', 'Transferred text prompt to Text-to-Speech editor.', 'info');
  };

  const userVoicesCount = voices.filter(
    (v) => v.createdBy.toLowerCase() === currentUser.email.toLowerCase() && v.status !== 'Deleted'
  ).length;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e5e5e5] flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        onOpenCloneModal={() => setIsCloneModalOpen(true)}
        myVoicesCount={userVoicesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'library' && (
          <VoiceLibraryView
            voices={voices}
            selectedVoice={selectedVoice}
            onSelectVoice={handleSelectVoice}
            onOpenCloneModal={() => setIsCloneModalOpen(true)}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'my_voices' && (
          <MyVoicesView
            voices={voices}
            selectedVoice={selectedVoice}
            onSelectVoice={handleSelectVoice}
            onDeleteVoice={handleDeleteVoice}
            onOpenCloneModal={() => setIsCloneModalOpen(true)}
            currentUserEmail={currentUser.email}
          />
        )}

        {currentTab === 'tts' && selectedVoice && (
          <TTSView
            voices={voices}
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            currentUserEmail={currentUser.email}
            onGenerationComplete={handleGenerationComplete}
            initialText={ttsInputText}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onReuseText={handleReuseText}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            voices={voices}
            users={users}
            stats={stats}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Voice Cloning Wizard Modal */}
      <VoiceCloningModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onVoiceCreated={handleVoiceCreated}
        currentUserEmail={currentUser.email}
        currentUserName={currentUser.name}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-start gap-3 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 shadow-2xl max-w-sm">
          <div
            className={`p-2 rounded-xl text-white shrink-0 ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-[#222222] border border-[#333333] text-amber-400'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">
              {toastMessage.title}
            </h4>
            {toastMessage.desc && (
              <p className="text-[11px] text-[#a3a3a3] mt-0.5 leading-relaxed">
                {toastMessage.desc}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#737373] hover:text-[#e5e5e5] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
