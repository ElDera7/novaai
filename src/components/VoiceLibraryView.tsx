import React, { useState } from 'react';
import { Search, Sparkles, Filter, Mic, Volume2, Globe, ArrowRight } from 'lucide-react';
import { Voice, VoiceCategory } from '../types';
import { VoiceCard } from './VoiceCard';

interface VoiceLibraryViewProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
  onOpenCloneModal: () => void;
  isLoading?: boolean;
}

export const VoiceLibraryView: React.FC<VoiceLibraryViewProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  onOpenCloneModal,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');

  const categories: string[] = [
    'All',
    'Narration',
    'Conversational',
    'Professional',
    'Character',
    'News',
    'Meditation',
  ];

  const filteredVoices = voices.filter((voice) => {
    // Only show active public voices in library
    if (voice.status !== 'Public' && !voice.isPublic) return false;

    // Category filter
    if (selectedCategory !== 'All' && voice.category !== selectedCategory) return false;

    // Gender filter
    if (selectedGender !== 'All' && voice.gender !== selectedGender) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = voice.name.toLowerCase().includes(q);
      const matchDesc = voice.description.toLowerCase().includes(q);
      const matchTags = voice.tags.some((t) => t.toLowerCase().includes(q));
      const matchAccent = voice.acousticProfile?.accent?.toLowerCase().includes(q);
      return matchName || matchDesc || matchTags || matchAccent;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#171717] via-[#121212] to-[#0a0a0a] border border-[#262626] rounded-3xl p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241c10] border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio-Grade Neural Voice Engine</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Explore AI Voices & Accents
          </h1>
          <p className="text-sm text-[#a3a3a3] leading-relaxed mb-6">
            Preview, select, and produce photorealistic speech across diverse vocal styles, genders, and dialects. Or clone your own custom voice in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="banner-clone-voice-btn"
              type="button"
              onClick={onOpenCloneModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Clone a New Voice</span>
            </button>

            <div className="text-xs text-[#8e8e8e] flex items-center gap-1.5 ml-2">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{filteredVoices.length} Studio Voices Available</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-600/10 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="voice-library-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by voice name, accent, tone, or style..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-xs text-[#f0f0f0] placeholder-[#737373] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-[#8e8e8e]">Gender:</span>
            <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
              {['All', 'Female', 'Male'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedGender === g
                      ? 'bg-[#282828] text-amber-400 border border-[#383838] shadow-xs'
                      : 'text-[#8e8e8e] hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#222222]">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-pill-${cat}`}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#f0f0f0] text-[#0d0d0d] font-bold shadow-sm'
                  : 'bg-[#181818] hover:bg-[#222222] text-[#8e8e8e] hover:text-white border border-[#262626]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-[#737373]">
          <div className="w-8 h-8 mx-auto border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading Voice Library...</p>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="py-16 text-center bg-[#141414] border border-[#262626] rounded-2xl p-8">
          <Volume2 className="w-12 h-12 text-[#404040] mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-white">
            No matching voices found
          </h3>
          <p className="text-xs text-[#8e8e8e] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or clone a custom voice using your own audio sample.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedGender('All');
            }}
            className="mt-4 px-4 py-2 bg-[#1c1c1c] hover:bg-[#262626] border border-[#2e2e2e] text-xs font-semibold rounded-xl text-[#d4d4d4]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice?.id === voice.id}
              onSelect={onSelectVoice}
            />
          ))}
        </div>
      )}
    </div>
  );
};
