import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Play,
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { GenerationHistoryItem } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface HistoryViewProps {
  history: GenerationHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onReuseText: (text: string, voiceId?: string) => void;
  isLoading?: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDeleteHistoryItem,
  onReuseText,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.text.toLowerCase().includes(q) ||
      item.voiceName.toLowerCase().includes(q)
    );
  });

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#222222] to-[#1a1a1a] border border-[#333333] text-amber-400 flex items-center justify-center shadow-md">
            <History className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-white">
                Generation History
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1c1917] text-amber-400 border border-amber-800/40">
                {history.length} {history.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e8e] mt-0.5">
              Listen to and download any previously generated audio without consuming credits.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search generations..."
            className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-xs text-[#f0f0f0] placeholder-[#737373] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="py-20 text-center text-[#737373]">
          <div className="w-8 h-8 mx-auto border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-20 text-center bg-[#141414] border border-[#262626] rounded-3xl p-8">
          <Volume2 className="w-12 h-12 text-[#404040] mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-white">
            No Generated Audio Records
          </h3>
          <p className="text-xs text-[#8e8e8e] mt-1 max-w-sm mx-auto">
            Your generated speech files will automatically be saved here so you can revisit and download them anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm transition-all hover:border-[#383838] space-y-4"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#333333] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.voiceName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-bold text-white">
                        {item.voiceName}
                      </span>
                      {item.emotion && item.emotion !== 'Neutral' && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#1e1e1e] text-[#a3a3a3] border border-[#2e2e2e]">
                          {item.emotion}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#737373]">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyText(item.id, item.text)}
                    className="p-1.5 text-[#737373] hover:text-white rounded-lg transition-colors"
                    title="Copy Text"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onReuseText(item.text, item.voiceId)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#1c1c1c] hover:bg-[#282828] text-[#d4d4d4] hover:text-amber-400 rounded-lg transition-colors border border-[#2e2e2e]"
                    title="Open in Text-to-Speech"
                  >
                    <span>Use in TTS</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 text-[#737373] hover:text-red-400 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Snippet */}
              <p className="text-xs text-[#d4d4d4] leading-relaxed bg-[#181818] p-3 rounded-xl border border-[#242424]">
                "{item.text}"
              </p>

              {/* Compact Audio Player */}
              <AudioPlayer
                audioUrl={item.audioUrl}
                voiceName={item.voiceName}
                durationHint={item.durationSeconds}
                compact={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
