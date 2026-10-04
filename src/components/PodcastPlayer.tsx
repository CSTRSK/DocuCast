import React, { useState, useEffect, useRef } from 'react';
import { PodcastItem } from '../types/podcast';
import { ttsEngine, TTSState } from '../services/ttsEngine';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Play, Pause, RotateCcw, RotateCw, Download, Check, Bookmark } from 'lucide-react';
import { generateSynthesizedPodcastWav, downloadFile } from '../services/audioExporter';
import { saveAudioBlob } from '../services/storage';

interface PodcastPlayerProps {
  podcast: PodcastItem;
  onSaveFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  onSaveFavorite,
  isFavorite = false
}) => {
  const [ttsState, setTtsState] = useState<TTSState>(ttsEngine.getState());
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isExportingAudio, setIsExportingAudio] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Subscribe to TTS changes & load segments whenever podcast or segments change
  useEffect(() => {
    ttsEngine.loadSegments(podcast.segments, podcast.id);
    const unsubscribe = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });

    return () => {
      unsubscribe();
    };
  }, [podcast.id, podcast.segments]);

  // Auto-scroll transcript to active segment
  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [ttsState.currentSegmentIndex]);

  const togglePlay = () => {
    if (ttsState.isPlaying) {
      ttsEngine.pause();
    } else {
      ttsEngine.play();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    ttsEngine.setSpeed(speed);
  };

  const handleExportAudio = async () => {
    try {
      setIsExportingAudio(true);
      setExportProgress(10);
      setExportDone(false);

      const wavBlob = await generateSynthesizedPodcastWav(podcast, (pct) => {
        setExportProgress(pct);
      });

      // Save into IndexedDB / OPFS
      await saveAudioBlob(podcast.id, wavBlob);

      // Trigger download
      downloadFile(wavBlob, `${podcast.title.replace(/\s+/g, '_')}.wav`, 'audio/wav');
      setExportDone(true);
      setTimeout(() => {
        setExportDone(false);
        setIsExportingAudio(false);
      }, 3000);
    } catch (err) {
      console.error('Audio export error:', err);
      setIsExportingAudio(false);
    }
  };

  const currentSpeaker = ttsState.currentSegment?.speaker || 'hostA';
  const currentSpeakerName = ttsState.currentSegment?.speakerName || 'Alex';
  const isHostA = currentSpeaker === 'hostA';

  return (
    <div className="space-y-4">
      {/* Player Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xl relative overflow-hidden transition-colors">
        {/* Ambient background glow */}
        <div
          className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
            isHostA ? 'bg-sky-500' : 'bg-amber-500'
          }`}
        />

        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
              {podcast.style.toUpperCase()} PODCAST
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5 truncate">
              {podcast.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Quelle: {podcast.documentName}
            </p>
          </div>

          {onSaveFavorite && (
            <button
              onClick={() => onSaveFavorite(podcast.id)}
              className={`p-2.5 rounded-2xl border transition-all shadow-sm ${
                isFavorite
                  ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Als Favorit markieren"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Waveform Visualizer */}
        <WaveformVisualizer
          isPlaying={ttsState.isPlaying}
          speaker={currentSpeaker}
        />

        {/* Current Speaking Host Highlight */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 backdrop-blur-sm min-h-[96px] flex flex-col justify-center transition-all shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className={`w-3 h-3 rounded-full ${
                ttsState.isPlaying ? 'animate-pulse' : ''
              } ${
                isHostA
                  ? 'bg-sky-500 dark:bg-sky-400 shadow-md shadow-sky-500/50'
                  : 'bg-amber-500 dark:bg-amber-400 shadow-md shadow-amber-500/50'
              }`}
            />
            <span className={`text-xs font-bold ${isHostA ? 'text-sky-700 dark:text-sky-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {currentSpeakerName} {isHostA ? '(Host A • Moderation)' : '(Host B • Analyse)'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto font-mono">
              Beitrag {ttsState.currentSegmentIndex + 1} von {podcast.segments.length}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed italic">
            "{ttsState.currentSegment?.text || 'Bereit zur Wiedergabe. Tippe auf Play.'}"
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 mb-4">
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 transition-all duration-300"
              style={{ width: `${ttsState.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>{Math.round((ttsState.progressPercent * podcast.totalEstimatedSeconds) / 100)}s</span>
            <span>~{Math.round(podcast.totalEstimatedSeconds)}s</span>
          </div>
        </div>

        {/* Main Controls: Skip -15s, Play/Pause, Skip +15s */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
          {/* Skip Back 15s */}
          <button
            onClick={() => ttsEngine.skipBackward15s()}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 active:scale-90 transition-all flex flex-col items-center gap-0.5 shadow-sm"
            title="15 Sekunden zurück"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">15s</span>
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 active:scale-95 transition-all ${
              ttsState.isPlaying
                ? 'bg-gradient-to-tr from-amber-500 to-rose-500'
                : 'bg-gradient-to-tr from-indigo-500 via-sky-500 to-indigo-600'
            }`}
          >
            {ttsState.isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Skip Forward 15s */}
          <button
            onClick={() => ttsEngine.skipForward15s()}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 active:scale-90 transition-all flex flex-col items-center gap-0.5 shadow-sm"
            title="15 Sekunden vor"
          >
            <RotateCw className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">15s</span>
          </button>
        </div>

        {/* Speed Controls & Audio Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-200 dark:border-slate-800/80">
          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  playbackSpeed === rate
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* WAV Export Button */}
          <button
            onClick={handleExportAudio}
            disabled={isExportingAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
              exportDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {exportDone ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Gespeichert</span>
              </>
            ) : isExportingAudio ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>{exportProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Audio (WAV) exportieren</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Interactive Transcript */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
            Live-Transkript (Antippen zum Springen)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {podcast.segments.length} Abschnitte
          </span>
        </div>

        <div
          ref={transcriptContainerRef}
          className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/40"
        >
          {podcast.segments.map((seg, idx) => {
            const isCurrent = idx === ttsState.currentSegmentIndex;
            const isHostA = seg.speaker === 'hostA';

            return (
              <div
                key={seg.id}
                ref={isCurrent ? activeSegmentRef : null}
                onClick={() => ttsEngine.jumpToSegment(idx)}
                className={`pt-2.5 pb-2 px-3 rounded-2xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 border border-indigo-200 dark:border-indigo-500/40 shadow-sm ring-1 ring-indigo-300 dark:ring-indigo-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isHostA ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}
                    >
                      {seg.speakerName}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping" />
                        Aktiv
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    ~{seg.estimatedDuration}s
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed transition-colors ${
                    isCurrent ? 'text-indigo-950 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {seg.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
