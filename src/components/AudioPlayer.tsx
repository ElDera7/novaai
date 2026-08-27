import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  voiceName?: string;
  durationHint?: number;
  autoPlay?: boolean;
  onDownload?: () => void;
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  voiceName,
  durationHint,
  autoPlay = false,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint || 0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, autoPlay]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Playback failed:', err);
      });
    }
  };

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const targetTime = ratio * duration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    const sanitizedTitle = (title || voiceName || 'generated_speech')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .substring(0, 30);
    link.download = `${sanitizedTitle}_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-[#181818] rounded-xl p-2 border border-[#2a2a2a]">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <button
          id={`play-btn-compact-${title || 'audio'}`}
          type="button"
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center justify-center transition-all shrink-0 shadow-sm border border-amber-500/30"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-[120px]">
          <WaveformVisualizer
            isPlaying={isPlaying}
            progress={progress}
            onSeek={handleSeek}
            height={20}
            barCount={28}
          />
        </div>

        <span className="text-xs font-mono text-[#8e8e8e] shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          id="compact-download-btn"
          type="button"
          onClick={handleDownload}
          className="p-1.5 text-[#737373] hover:text-white transition-colors"
          title="Download Audio"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && (
            <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
              {title}
            </h4>
          )}
          {voiceName && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generated with {voiceName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="speed-toggle-btn"
            type="button"
            onClick={handleSpeedChange}
            className="text-xs font-mono font-medium px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#282828] text-[#d4d4d4] rounded-lg transition-colors border border-[#2e2e2e]"
            title="Change Playback Speed"
          >
            {playbackSpeed}x
          </button>

          <button
            id="download-btn-player"
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#282828] text-[#d4d4d4] hover:text-white rounded-lg transition-colors border border-[#2e2e2e]"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download Audio</span>
          </button>
        </div>
      </div>

      {/* Waveform Visualization Canvas */}
      <div className="bg-[#0d0d0d] rounded-xl p-3 mb-4 border border-[#222222]">
        <WaveformVisualizer
          isPlaying={isPlaying}
          progress={progress}
          onSeek={handleSeek}
          height={40}
          barCount={54}
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="main-play-pause-btn"
            type="button"
            onClick={togglePlayPause}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center justify-center transition-all shadow-md shadow-amber-950/50 border border-amber-500/30 hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            id="reset-audio-btn"
            type="button"
            onClick={() => handleSeek(0)}
            className="p-2 text-[#737373] hover:text-white transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono text-[#8e8e8e]">
            <span className="font-semibold text-white">{formatTime(currentTime)}</span>
            <span className="text-[#525252] mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="mute-toggle-btn"
            type="button"
            onClick={toggleMute}
            className="p-2 text-[#737373] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
