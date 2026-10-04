import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  speaker: 'hostA' | 'hostB';
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  speaker,
  barCount = 28
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isPlaying) {
          // Dynamic simulated wave using multi-frequency sines
          const freq1 = Math.sin(phase * 0.08 + i * 0.35);
          const freq2 = Math.cos(phase * 0.12 + i * 0.2);
          const norm = Math.abs(freq1 * 0.6 + freq2 * 0.4);
          barHeight = Math.max(6, norm * (height * 0.85));
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Gradient based on current speaker
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (speaker === 'hostA') {
          grad.addColorStop(0, '#38bdf8'); // sky-400
          grad.addColorStop(1, '#6366f1'); // indigo-500
        } else {
          grad.addColorStop(0, '#f59e0b'); // amber-500
          grad.addColorStop(1, '#d946ef'); // fuchsia-500
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded caps
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      phase += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speaker, barCount]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={48}
        className="w-full max-w-sm h-12 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 shadow-inner transition-colors"
      />
    </div>
  );
};
