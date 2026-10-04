import React from 'react';
import { PlusCircle, FileEdit, Headphones, Library, Radio } from 'lucide-react';

export type AppTab = 'upload' | 'settings' | 'script' | 'player' | 'library';

interface BottomNavigationProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  hasDocument: boolean;
  hasScript: boolean;
  isPlaying: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
  hasDocument,
  hasScript,
  isPlaying
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg pb-safe shadow-lg transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Upload / Create Tab */}
        <button
          onClick={() => onChangeTab('upload')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'upload' || currentTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Erstellen</span>
        </button>

        {/* Script Editor Tab */}
        <button
          onClick={() => onChangeTab('script')}
          disabled={!hasScript}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
            !hasScript
              ? 'opacity-40 cursor-not-allowed text-slate-300 dark:text-slate-600'
              : currentTab === 'script'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Skript</span>
          {hasScript && (
            <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
          )}
        </button>

        {/* Player Tab */}
        <button
          onClick={() => onChangeTab('player')}
          disabled={!hasScript}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
            !hasScript
              ? 'opacity-40 cursor-not-allowed text-slate-300 dark:text-slate-600'
              : currentTab === 'player'
              ? 'text-sky-600 dark:text-sky-400 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Headphones className="w-5 h-5" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Player</span>
        </button>

        {/* Library Tab */}
        <button
          onClick={() => onChangeTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'library'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Bibliothek</span>
        </button>
      </div>
    </nav>
  );
};
