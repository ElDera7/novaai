import React, { useState } from 'react';
import { FolderHeart, Plus, Mic, Sparkles, Trash2, ArrowRight, Lock, Globe, AlertCircle } from 'lucide-react';
import { Voice } from '../types';
import { VoiceCard } from './VoiceCard';

interface MyVoicesViewProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
  onDeleteVoice: (voice: Voice) => void;
  onOpenCloneModal: () => void;
  currentUserEmail: string;
}

export const MyVoicesView: React.FC<MyVoicesViewProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  onDeleteVoice,
  onOpenCloneModal,
  currentUserEmail,
}) => {
  const [voiceToDelete, setVoiceToDelete] = useState<Voice | null>(null);

  // Filter voices owned by current user
  const myVoices = voices.filter(
    (v) => v.createdBy.toLowerCase() === currentUserEmail.toLowerCase() && v.status !== 'Deleted'
  );

  const confirmDelete = () => {
    if (voiceToDelete) {
      onDeleteVoice(voiceToDelete);
      setVoiceToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#222222] to-[#1a1a1a] border border-[#333333] text-amber-400 flex items-center justify-center shadow-md">
            <FolderHeart className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-white">
                My Cloned Voices
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1e1c18] text-amber-400 border border-amber-800/40">
                {myVoices.length} {myVoices.length === 1 ? 'Voice' : 'Voices'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e8e] mt-0.5">
              Private custom voices cloned from your audio samples. Only accessible by your account.
            </p>
          </div>
        </div>

        <button
          id="my-voices-clone-btn"
          type="button"
          onClick={onOpenCloneModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/40 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Clone Another Voice</span>
        </button>
      </div>

      {/* Security / Privacy Banner */}
      <div className="bg-[#121212] border border-[#222222] rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-[#1c1c1c] text-amber-400 border border-[#2e2e2e] rounded-xl shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#a3a3a3] leading-relaxed">
          <strong className="text-white">Voice Privacy Guarantee:</strong> Your cloned voices are private and restricted to your account by default. You can use them across Text-to-Speech anytime. If requested, an administrator can promote exceptional voices to the public Voice Library.
        </div>
      </div>

      {/* Cloned Voices Grid */}
      {myVoices.length === 0 ? (
        <div className="py-20 text-center bg-[#141414] border border-[#262626] rounded-3xl p-8">
          <div className="w-16 h-16 rounded-3xl bg-[#1c1c1c] border border-[#2e2e2e] text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white">
            No Custom Voices Yet
          </h3>
          <p className="text-xs text-[#8e8e8e] mt-1 max-w-sm mx-auto mb-6">
            Upload or record a 1-minute audio sample to clone your voice or create a unique persona.
          </p>
          <button
            id="empty-state-clone-btn"
            type="button"
            onClick={onOpenCloneModal}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/50 border border-amber-500/30 transition-all hover:scale-105"
          >
            Clone Your First Voice
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice?.id === voice.id}
              onSelect={onSelectVoice}
              onDelete={(v) => setVoiceToDelete(v)}
              showUserControls={true}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {voiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-serif text-base font-bold text-white">
                Delete Cloned Voice?
              </h3>
            </div>
            <p className="text-xs text-[#a3a3a3]">
              Are you sure you want to delete <strong className="text-white">{voiceToDelete.name}</strong>? This voice will no longer be available for speech generation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVoiceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8e8e8e] hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-voice-btn"
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Delete Voice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
