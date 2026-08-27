import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  onSeek?: (ratio: number) => void;
  barCount?: number;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  progress,
  onSeek,
  barCount = 48,
  height = 36,
  activeColor = 'rgb(245, 158, 11)', // amber-500
  inactiveColor = 'rgb(45, 45, 45)', // dark surface-2
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate pseudo-random deterministic heights for bars
  const barHeightsRef = useRef<number[]>([]);
  if (barHeightsRef.current.length !== barCount) {
    const bars: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Natural speech-like waveform distribution (higher in middle)
      const centerFactor = Math.sin((i / barCount) * Math.PI);
      const randomNoise = 0.3 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.7;
      bars.push(Math.max(0.15, centerFactor * randomNoise));
    }
    barHeightsRef.current = bars;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, width, ch);

      const barWidth = Math.max(2, (width / barCount) - 2);
      const gap = (width - (barWidth * barCount)) / (barCount - 1);

      const activeBarIndex = Math.floor(progress * barCount);
      const time = Date.now() / 200;

      for (let i = 0; i < barCount; i++) {
        let hRatio = barHeightsRef.current[i];
        
        // Add subtle pulsation when playing
        if (isPlaying) {
          const wave = Math.sin(time + i * 0.4) * 0.15;
          hRatio = Math.max(0.1, Math.min(1, hRatio + wave));
        }

        const barHeight = Math.max(4, hRatio * (ch - 4));
        const x = i * (barWidth + gap);
        const y = (ch - barHeight) / 2;

        const isPast = i <= activeBarIndex;
        ctx.fillStyle = isPast ? activeColor : inactiveColor;

        // Rounded bar
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, progress, barCount, activeColor, inactiveColor]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio);
  };

  return (
    <div className="relative w-full cursor-pointer flex items-center" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height * 2}
        onClick={handleCanvasClick}
        className="w-full h-full block"
      />
    </div>
  );
};
