import React, { useState, useEffect } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Sparkles,
  Sliders,
  ChevronDown,
  RotateCcw,
  Volume2,
  Check,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Voice, GenerationHistoryItem } from '../types';
import { API } from '../services/api';
import { AudioPlayer } from './AudioPlayer';

interface TTSViewProps {
  voices: Voice[];
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  currentUserEmail: string;
  onGenerationComplete?: (item: GenerationHistoryItem) => void;
  initialText?: string;
}

export const TTSView: React.FC<TTSViewProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  currentUserEmail,
  onGenerationComplete,
  initialText = '',
}) => {
  const [text, setText] = useState<string>(
    initialText ||
      'Welcome to VoiceNova. This is a demonstration of our next-generation AI speech synthesis platform, capable of generating ultra-realistic voices from any script.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio output state
  const [lastGeneratedAudioUrl, setLastGeneratedAudioUrl] = useState<string | null>(null);
  const [lastGeneratedItem, setLastGeneratedItem] = useState<GenerationHistoryItem | null>(null);
  const [generationDuration, setGenerationDuration] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Acoustic Controls
  const [emotion, setEmotion] = useState<'Neutral' | 'Cheerful' | 'Authoritative' | 'Whispering' | 'Dramatic' | 'Conversational' | 'Energetic'>('Neutral');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [showAcousticControls, setShowAcousticControls] = useState<boolean>(true);

  // Voice selector modal/popover
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);

  // Update text if initialText changes
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  // Sample prompt scripts
  const sampleScripts = [
    {
      title: 'Podcast Intro',
      text: "Welcome back to The Frontier Tech Show, where we decode the breakthroughs shaping tomorrow's digital universe. I'm your host, and today we have a special guest.",
    },
    {
      title: 'Audiobook Narration',
      text: 'The rain tapped gently against the leaded glass windows of the old library. Elena closed the heavy leather journal, knowing that the secret contained within would change everything.',
    },
    {
      title: 'Product Announcement',
      text: 'Today, we are thrilled to introduce VoiceNova 3.0. Built with neural acoustic cloning, it delivers studio-grade voice synthesis directly in your browser with zero latency.',
    },
    {
      title: 'Customer Support',
      text: 'Thank you for calling customer care. All of our specialized representatives are currently assisting other clients. Please hold, and we will connect you shortly.',
    },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMessage('Please enter some text to generate speech.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await API.generateSpeech({
        voiceId: selectedVoice.id,
        text: text.trim(),
        speed,
        pitch,
        emotion,
        userId: currentUserEmail,
      });

      setLastGeneratedAudioUrl(response.audioUrl);
      setGenerationDuration(response.durationSeconds);
      setLastGeneratedItem(response.historyItem);
      setLatencyMs(response.latencyMs);

      if (onGenerationComplete) {
        onGenerationComplete(response.historyItem);
      }
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      setErrorMessage(err.message || 'Speech generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedReadSecs = Math.max(1, Math.round((wordCount / (3.2 * speed))));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Text to Speech Studio
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-1">
            Transform scripts into natural, expressive speech with the selected voice model.
          </p>
        </div>

        {/* Quick Voice Selector Badge */}
        <button
          id="tts-change-voice-btn"
          type="button"
          onClick={() => setShowVoicePicker(true)}
          className="flex items-center gap-3 p-2.5 pr-4 bg-[#141414] border border-[#2a2a2a] rounded-2xl hover:border-amber-500/60 hover:bg-[#1a1a1a] transition-all shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-[#222222] border border-[#333333] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            {selectedVoice.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{selectedVoice.name}</span>
              <span className="text-[10px] font-normal text-amber-400">
                ({selectedVoice.isPublic ? 'Public' : 'Cloned'})
              </span>
            </div>
            <div className="text-[10px] text-[#737373] truncate max-w-[140px]">
              {selectedVoice.gender} • {selectedVoice.acousticProfile?.accent || 'Studio'}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#737373] ml-1" />
        </button>
      </div>

      {/* Main Generation Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {errorMessage && (
          <div className="p-4 bg-[#261313] border border-red-800/60 rounded-2xl flex items-start gap-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Script Quick Templates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#d4d4d4]">
              Input Script
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#737373] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Est. ~{estimatedReadSecs}s audio
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="tts-script-input"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want the AI voice to speak..."
              className="w-full text-sm leading-relaxed p-4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl text-[#f0f0f0] placeholder-[#737373] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 resize-y"
            />
            <div className="flex items-center justify-between px-1 mt-1 text-[11px] text-[#737373]">
              <span>{wordCount} words</span>
              <span>{text.length} / 5,000 characters</span>
            </div>
          </div>

          {/* Sample Scripts Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-[#737373] shrink-0">
              Templates:
            </span>
            {sampleScripts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(sample.text)}
                className="text-[11px] font-medium px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#a3a3a3] hover:text-white rounded-lg whitespace-nowrap transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Acoustic Customization Accordion */}
        <div className="border-t border-[#222222] pt-5">
          <button
            type="button"
            onClick={() => setShowAcousticControls(!showAcousticControls)}
            className="flex items-center justify-between w-full text-xs font-bold text-[#e5e5e5] hover:text-amber-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Voice Performance & Acoustic Fine-Tuning</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#737373] transition-transform ${
                showAcousticControls ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAcousticControls && (
            <div className="mt-4 p-4 bg-[#181818] rounded-2xl border border-[#282828] space-y-5 animate-fade-in">
              {/* Emotion Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#a3a3a3] mb-2">
                  Emotion & Vocal Delivery
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Neutral',
                    'Cheerful',
                    'Authoritative',
                    'Conversational',
                    'Dramatic',
                    'Whispering',
                    'Energetic',
                  ].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setEmotion(emo as any)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                        emotion === emo
                          ? 'bg-[#282828] text-amber-400 border border-[#3e3e3e] shadow-xs'
                          : 'bg-[#141414] text-[#8e8e8e] hover:text-white border border-[#262626]'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed & Pitch Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    <span>Speaking Speed</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {speed.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="tts-speed-slider"
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#737373] mt-1">
                    <span>0.5x (Slow)</span>
                    <span>1.0x (Natural)</span>
                    <span>2.0x (Fast)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    <span>Pitch Modulation</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {pitch > 0 ? `+${pitch}` : pitch}
                    </span>
                  </div>
                  <input
                    id="tts-pitch-slider"
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={pitch}
                    onChange={(e) => setPitch(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-[#737373] mt-1">
                    <span>-6 (Deeper)</span>
                    <span>0 (Default)</span>
                    <span>+6 (Higher)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button Row */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setSpeed(1.0);
              setPitch(0);
              setEmotion('Neutral');
            }}
            className="text-xs font-semibold text-[#737373] hover:text-[#d4d4d4] flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Settings</span>
          </button>

          <button
            id="tts-generate-audio-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className={`px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
              isGenerating
                ? 'bg-amber-700/60 text-white cursor-wait'
                : !text.trim()
                ? 'bg-[#222222] text-[#666666] cursor-not-allowed border border-[#333333]'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-950/50 border border-amber-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Voice...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Audio Player Output */}
      {lastGeneratedAudioUrl && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generated Audio Result</span>
            </h3>
            {latencyMs && (
              <span className="text-[11px] font-mono text-[#737373]">
                Rendered in {latencyMs}ms
              </span>
            )}
          </div>

          <AudioPlayer
            audioUrl={lastGeneratedAudioUrl}
            title={text.length > 60 ? `${text.substring(0, 60)}...` : text}
            voiceName={selectedVoice.name}
            durationHint={generationDuration}
            autoPlay={true}
          />
        </div>
      )}

      {/* Voice Picker Modal */}
      {showVoicePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <h3 className="font-serif text-base font-bold text-white">
                Select Voice Model
              </h3>
              <button
                type="button"
                onClick={() => setShowVoicePicker(false)}
                className="text-xs font-semibold text-[#8e8e8e] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {voices
                .filter((v) => v.status === 'Public' || v.createdBy.toLowerCase() === currentUserEmail.toLowerCase())
                .map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelectVoice(v);
                      setShowVoicePicker(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedVoice.id === v.id
                        ? 'border-amber-500/80 bg-[#1c1812]'
                        : 'border-[#262626] bg-[#181818] hover:border-[#383838] hover:bg-[#1e1e1e]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#242424] border border-[#333333] text-amber-400 flex items-center justify-center font-bold text-xs">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{v.name}</span>
                          <span className="text-[10px] text-amber-400 font-normal">
                            ({v.isPublic ? 'Public' : 'Cloned'})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8e8e8e] line-clamp-1">
                          {v.description}
                        </div>
                      </div>
                    </div>

                    {selectedVoice.id === v.id && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
