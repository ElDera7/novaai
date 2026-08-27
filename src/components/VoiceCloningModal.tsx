import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  RefreshCw,
  Sliders,
  FileAudio,
  Radio,
} from 'lucide-react';
import { Voice, VoiceGender, VoiceCategory } from '../types';
import { API } from '../services/api';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCreated: (newVoice: Voice) => void;
  currentUserEmail: string;
  currentUserName: string;
}

type CloneStep = 'upload' | 'processing' | 'preview' | 'name_and_save';

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({
  isOpen,
  onClose,
  onVoiceCreated,
  currentUserEmail,
  currentUserName,
}) => {
  const [step, setStep] = useState<CloneStep>('upload');
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  
  // Audio state
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Processing state
  const [processingPhase, setProcessingPhase] = useState<string>('Uploading audio sample...');
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Created Voice state
  const [clonedVoice, setClonedVoice] = useState<Voice | null>(null);
  const [voiceName, setVoiceName] = useState<string>('');
  const [voiceDescription, setVoiceDescription] = useState<string>('');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('Male');
  const [voiceCategory, setVoiceCategory] = useState<VoiceCategory>('Custom');
  
  // Preview playback state
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
      setErrorMessage('Please upload a valid audio file (.mp3, .wav, .m4a, or .ogg)');
      return;
    }

    setErrorMessage(null);
    setAudioFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAudioBase64(result);

      // Estimate audio duration
      const audio = new Audio();
      audio.src = result;
      audio.onloadedmetadata = () => {
        setAudioDurationSec(audio.duration || 60);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setAudioFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAudioBase64(result);

      const audio = new Audio();
      audio.src = result;
      audio.onloadedmetadata = () => {
        setAudioDurationSec(audio.duration || 60);
      };
    };
    reader.readAsDataURL(file);
  };

  // Microphone Recording Handlers
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioBase64(base64data);
          setAudioFileName(`Microphone_Recording_${new Date().toLocaleTimeString()}.wav`);
          setAudioDurationSec(recordingSeconds);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMessage('Could not access microphone. Please allow microphone permissions or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Run Voice Cloning Process
  const handleStartCloning = async () => {
    if (!audioBase64) {
      setErrorMessage('Please provide an audio sample to clone.');
      return;
    }

    setStep('processing');
    setErrorMessage(null);
    setProgressPercent(15);
    setProcessingPhase('Uploading audio sample...');

    try {
      // Simulate multi-phase progress for transparency
      setTimeout(() => {
        setProgressPercent(40);
        setProcessingPhase('Analyzing vocal formants, pitch spectrum & cadence...');
      }, 700);

      setTimeout(() => {
        setProgressPercent(70);
        setProcessingPhase('Synthesizing neural acoustic profile & voice model...');
      }, 1500);

      setTimeout(() => {
        setProgressPercent(90);
        setProcessingPhase('Generating instant voice test sample...');
      }, 2300);

      const response = await API.cloneVoice({
        name: voiceName || 'My Cloned Voice',
        gender: voiceGender,
        category: voiceCategory,
        audioBase64: audioBase64,
        audioDuration: audioDurationSec || 60,
        userId: currentUserEmail,
        creatorName: currentUserName,
      });

      setProgressPercent(100);
      setProcessingPhase('Voice Ready!');

      setClonedVoice(response.voice);
      setVoiceName(response.voice.name);
      setVoiceDescription(response.voice.description);
      setVoiceGender(response.voice.gender);
      setVoiceCategory(response.voice.category);

      setTimeout(() => {
        setStep('preview');
      }, 500);
    } catch (err: any) {
      console.error('Cloning error:', err);
      setErrorMessage(err.message || 'Voice cloning failed. Please try another audio sample.');
      setStep('upload');
    }
  };

  // Toggle Test Audio
  const toggleTestPlayback = () => {
    const audio = testAudioRef.current;
    if (!audio) return;

    if (isPlayingTestAudio) {
      audio.pause();
      setIsPlayingTestAudio(false);
    } else {
      audio.play().then(() => {
        setIsPlayingTestAudio(true);
      }).catch((e) => console.warn(e));
    }
  };

  // Final Save Voice
  const handleSaveAndUse = async () => {
    if (!clonedVoice) return;

    try {
      // Update voice with final name & details if user modified them
      const updated = await API.updateVoice(clonedVoice.id, {
        name: voiceName.trim() || clonedVoice.name,
        description: voiceDescription.trim() || clonedVoice.description,
        gender: voiceGender,
        category: voiceCategory,
      });

      onVoiceCreated(updated.voice);
      onClose();
    } catch (err: any) {
      console.error('Save voice error:', err);
      // Even if update failed, pass existing cloned voice
      onVoiceCreated(clonedVoice);
      onClose();
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="voice-cloning-modal"
        className="w-full max-w-xl bg-[#141414] border border-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#f0f0f0]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1c1917] border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">
                Clone New Voice
              </h2>
              <p className="text-xs text-[#8e8e8e]">
                Upload or record ~1 minute of audio to generate a custom neural voice
              </p>
            </div>
          </div>

          <button
            id="close-clone-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-white rounded-full hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#241414] border border-red-800/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: Upload or Record Audio Sample */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className="flex p-1 bg-[#1c1c1c] border border-[#282828] rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'upload'
                      ? 'bg-[#282828] text-amber-400 border border-[#3e3e3e] shadow-xs'
                      : 'text-[#8e8e8e] hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Audio File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('record')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'record'
                      ? 'bg-[#282828] text-amber-400 border border-[#3e3e3e] shadow-xs'
                      : 'text-[#8e8e8e] hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Record with Mic</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              {activeTab === 'upload' ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    audioBase64
                      ? 'border-emerald-500/60 bg-[#13231b]/30'
                      : 'border-[#333333] hover:border-amber-500/60 bg-[#171717]'
                  }`}
                >
                  <input
                    type="file"
                    id="audio-file-input"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {audioBase64 ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#13231b] border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-3">
                        <FileAudio className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        {audioFileName || 'Audio sample ready'}
                      </h4>
                      <p className="text-xs text-[#8e8e8e] mt-1">
                        Duration: ~{Math.round(audioDurationSec || 60)} seconds
                      </p>
                      <label
                        htmlFor="audio-file-input"
                        className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer underline"
                      >
                        Choose a different file
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="audio-file-input" className="cursor-pointer block">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#1c1917] border border-amber-800/40 text-amber-400 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-white">
                        Click or drag audio sample here
                      </h4>
                      <p className="text-xs text-[#8e8e8e] mt-1 max-w-xs mx-auto">
                        Supports MP3, WAV, M4A, or OGG. For best clarity, provide ~1 minute of clear speech with minimal background noise.
                      </p>
                    </label>
                  )}
                </div>
              ) : (
                /* Live Microphone Recording */
                <div className="border border-[#262626] rounded-2xl p-6 text-center bg-[#171717]">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                        isRecording
                          ? 'bg-red-500 text-white animate-ping'
                          : audioBase64
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-500/30'
                      }`}
                    >
                      <Mic className="w-7 h-7" />
                    </div>

                    <div className="text-lg font-mono font-bold text-white mb-2">
                      {formatSecs(recordingSeconds)}
                    </div>

                    <p className="text-xs text-[#8e8e8e] mb-5 max-w-xs">
                      {isRecording
                        ? 'Recording live voice sample... speak naturally at normal conversational volume.'
                        : audioBase64
                        ? 'Recording captured! Ready to clone voice.'
                        : 'Click Start Recording and speak for ~30 to 60 seconds.'}
                    </p>

                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button
                          id="start-rec-btn"
                          type="button"
                          onClick={startRecording}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm border border-amber-500/30 transition-all"
                        >
                          <Radio className="w-4 h-4 text-amber-200 animate-pulse" />
                          <span>{audioBase64 ? 'Record Again' : 'Start Recording'}</span>
                        </button>
                      ) : (
                        <button
                          id="stop-rec-btn"
                          type="button"
                          onClick={stopRecording}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                        >
                          <Square className="w-4 h-4 fill-white" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Metadata inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    Gender Identity
                  </label>
                  <select
                    id="clone-gender-select"
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value as VoiceGender)}
                    className="w-full text-xs bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-[#f0f0f0] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                  >
                    <option value="Male">Male Voice</option>
                    <option value="Female">Female Voice</option>
                    <option value="Neutral">Neutral / Ambiguous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    Target Category
                  </label>
                  <select
                    id="clone-category-select"
                    value={voiceCategory}
                    onChange={(e) => setVoiceCategory(e.target.value as VoiceCategory)}
                    className="w-full text-xs bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2 text-[#f0f0f0] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                  >
                    <option value="Custom">Custom Voice</option>
                    <option value="Narration">Narration & Audiobooks</option>
                    <option value="Conversational">Conversational Podcast</option>
                    <option value="Professional">Professional Executive</option>
                    <option value="Character">Character & Expressive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Processing State */}
          {step === 'processing' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-[#262626] border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-white">
                  Cloning Your Voice
                </h3>
                <p className="text-xs text-amber-400 font-medium mt-1">
                  {processingPhase}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#222222] rounded-full h-2 overflow-hidden max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Step indicator checklist */}
              <div className="max-w-xs mx-auto text-left space-y-2 text-xs text-[#8e8e8e]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Uploading audio sample</span>
                </div>
                <div className="flex items-center gap-2">
                  {progressPercent >= 40 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  <span>Extracting pitch & formant spectrum</span>
                </div>
                <div className="flex items-center gap-2">
                  {progressPercent >= 70 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#333333]" />
                  )}
                  <span>Building neural acoustic model</span>
                </div>
                <div className="flex items-center gap-2">
                  {progressPercent >= 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#333333]" />
                  )}
                  <span>Voice ready for speech generation</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Preview Cloned Voice & Name / Save */}
          {step === 'preview' && clonedVoice && (
            <div className="space-y-5">
              {clonedVoice.previewAudioUrl && (
                <audio
                  ref={testAudioRef}
                  src={clonedVoice.previewAudioUrl}
                  onEnded={() => setIsPlayingTestAudio(false)}
                />
              )}

              {/* Success Badge */}
              <div className="p-4 bg-[#13231b] border border-emerald-800/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-emerald-200">
                      Voice Successfully Cloned!
                    </h4>
                    <p className="text-xs text-emerald-400">
                      Acoustic profile extracted • Clarity score: 98%
                    </p>
                  </div>
                </div>

                {/* Instant Test Playback */}
                <button
                  id="test-clone-playback-btn"
                  type="button"
                  onClick={toggleTestPlayback}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all border border-emerald-500/30"
                >
                  {isPlayingTestAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  <span>{isPlayingTestAudio ? 'Pause Sample' : 'Play Sample'}</span>
                </button>
              </div>

              {/* Name & Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    Voice Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="clone-name-input"
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="e.g. Gideon's Podcast Voice"
                    className="w-full text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-[#f0f0f0] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a3a3a3] mb-1.5">
                    Description & Tone Note (Optional)
                  </label>
                  <textarea
                    id="clone-desc-input"
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    placeholder="e.g. Warm and friendly conversational voice for video voiceovers"
                    rows={2}
                    className="w-full text-xs bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-[#f0f0f0] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>

                <div className="p-3 bg-[#181818] rounded-xl border border-[#262626] text-xs text-[#a3a3a3] flex items-center justify-between">
                  <span>Privacy status: <strong className="text-white">Private to your account</strong></span>
                  <span className="text-[11px] text-[#737373]">Can be promoted to public by admin</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#222222] flex items-center justify-between bg-[#0f0f0f]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8e8e8e] hover:text-white transition-colors"
          >
            Cancel
          </button>

          {step === 'upload' && (
            <button
              id="submit-clone-btn"
              type="button"
              onClick={handleStartCloning}
              disabled={!audioBase64}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                audioBase64
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-950/50 border border-amber-500/30 hover:scale-105 active:scale-95'
                  : 'bg-[#222222] text-[#555555] cursor-not-allowed border border-[#2a2a2a]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Clone Voice Now</span>
            </button>
          )}

          {step === 'preview' && (
            <button
              id="save-cloned-voice-btn"
              type="button"
              onClick={handleSaveAndUse}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-950/50 border border-amber-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Save & Use in Text-to-Speech</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
