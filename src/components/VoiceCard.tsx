import React, { useState, useRef } from 'react';
import { Play, Pause, Sparkles, User, Globe, Lock, Trash2, ArrowRight, Activity, Share2 } from 'lucide-react';
import { Voice } from '../types';

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect?: (voice: Voice) => void;
  onDelete?: (voice: Voice) => void;
  onPromote?: (voice: Voice) => void;
  showAdminControls?: boolean;
  showUserControls?: boolean;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected = false,
  onSelect,
  onDelete,
  onPromote,
  showAdminControls = false,
  showUserControls = false,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((err) => {
        console.warn('Preview play error:', err);
      });
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingPreview(false);
  };

  // Avatar color generator based on voice ID
  const getAvatarGradient = (id: string, gender: string) => {
    if (gender === 'Female') {
      return 'from-rose-500 to-amber-500';
    } else if (gender === 'Male') {
      return 'from-blue-600 to-indigo-600';
    }
    return 'from-emerald-500 to-teal-600';
  };

  return (
    <div
      id={`voice-card-${voice.id}`}
      className={`relative group flex flex-col justify-between bg-[#141414] border rounded-2xl p-5 transition-all duration-200 hover:shadow-xl ${
        isSelected
          ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-md bg-[#1a1712]'
          : 'border-[#262626] hover:border-[#3a3a3a]'
      }`}
    >
      {voice.previewAudioUrl && (
        <audio
          ref={audioRef}
          src={voice.previewAudioUrl}
          onEnded={handleAudioEnded}
          onError={() => setIsPlayingPreview(false)}
          preload="none"
        />
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                voice.id,
                voice.gender
              )} text-white flex items-center justify-center font-bold text-sm shadow-md border border-white/10 shrink-0`}
            >
              {voice.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-white text-base leading-tight">
                  {voice.name}
                </h3>
                {voice.isPublic ? (
                  <span title="Public Voice Library" className="text-amber-400">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span title="Private User Voice" className="text-amber-500">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8e8e8e] mt-0.5">
                {voice.gender} • {voice.acousticProfile?.accent || 'Natural'}
              </p>
            </div>
          </div>

          {/* Preview Play Button */}
          <button
            id={`preview-voice-btn-${voice.id}`}
            type="button"
            onClick={togglePreview}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 border ${
              isPlayingPreview
                ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                : 'bg-[#1c1c1c] hover:bg-[#262626] text-[#d4d4d4] hover:text-amber-400 border-[#2e2e2e]'
            }`}
            title={isPlayingPreview ? 'Pause sample preview' : 'Listen to voice preview'}
          >
            {isPlayingPreview ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[#a3a3a3] line-clamp-2 leading-relaxed mb-3">
          {voice.description || 'Neural voice profile engineered for expressive speech synthesis.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-[#d4d4d4] border border-[#2e2e2e]">
            {voice.category}
          </span>
          {voice.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#181818] text-[#8e8e8e] border border-[#262626]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {showUserControls && onDelete && (
            <button
              id={`delete-voice-${voice.id}`}
              type="button"
              onClick={() => onDelete(voice)}
              className="p-1.5 text-[#737373] hover:text-red-400 transition-colors rounded-md"
              title="Delete this cloned voice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {showAdminControls && onPromote && !voice.isPublic && (
            <button
              id={`promote-voice-${voice.id}`}
              type="button"
              onClick={() => onPromote(voice)}
              className="text-[11px] font-medium px-2 py-1 bg-[#142618] hover:bg-[#1a3822] text-emerald-300 rounded-md border border-emerald-800/60 transition-colors flex items-center gap-1"
              title="Promote to Public Voice Library"
            >
              <Globe className="w-3 h-3" />
              <span>Publish</span>
            </button>
          )}

          {voice.createdAt && (
            <span className="text-[11px] text-[#737373]">
              {new Date(voice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Main "Use Voice" Button */}
        {onSelect && (
          <button
            id={`use-voice-btn-${voice.id}`}
            type="button"
            onClick={() => onSelect(voice)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
              isSelected
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#f0f0f0] hover:bg-amber-600 text-[#0d0d0d] hover:text-white'
            }`}
          >
            <span>{isSelected ? 'Selected' : 'Use Voice'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
