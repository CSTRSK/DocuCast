import React from 'react';
import { Radio, Wifi, WifiOff, Sun, Moon, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activePodcastTitle?: string;
  onOpenPlayer?: () => void;
  isPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  activePodcastTitle,
  onOpenPlayer,
  isPlaying
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors">
              <Radio className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Docu<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500 dark:from-indigo-400 dark:to-sky-400">Cast</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Clientseitige Dokument-zu-Podcast PWA
            </p>
          </div>
        </div>

        {/* Mini Now-Playing bar if podcast is loaded */}
        {activePodcastTitle && (
          <button
            onClick={onOpenPlayer}
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate transition-all shadow-sm"
          >
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-indigo-500'}`} />
            <span className="truncate">{activePodcastTitle}</span>
          </button>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline status pill */}
          <div
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
            }`}
            title={isOnline ? 'Online - Service Worker aktiv' : 'Offline - Arbeitet 100% lokal'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Bereit</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
            title={isDark ? 'Heller Modus' : 'Dunkler Modus'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
