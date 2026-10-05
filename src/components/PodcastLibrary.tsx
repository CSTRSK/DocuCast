import React, { useState } from 'react';
import { PodcastItem } from '../types/podcast';
import { Play, Bookmark, Trash2, Download, Search, FileAudio, FileText, Globe } from 'lucide-react';
import { exportScriptAsMarkdown, downloadFile, generatePodcastWav } from '../services/audioExporter';
import { getAudioBlob, saveAudioBlob } from '../services/storage';
import { G20TranslateModal } from './G20TranslateModal';

interface PodcastLibraryProps {
  podcasts: PodcastItem[];
  onSelectPodcast: (podcast: PodcastItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeletePodcast: (id: string) => void;
  onNewPodcast: () => void;
  onUpdatePodcast?: (podcast: PodcastItem) => void;
}

export const PodcastLibrary: React.FC<PodcastLibraryProps> = ({
  podcasts,
  onSelectPodcast,
  onToggleFavorite,
  onDeletePodcast,
  onNewPodcast,
  onUpdatePodcast
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [translatingPodcast, setTranslatingPodcast] = useState<PodcastItem | null>(null);

  const filtered = podcasts.filter((p) => {
    if (filter === 'favorites' && !p.isFavorite) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = p.title.toLowerCase().includes(q);
      const inDoc = p.documentName.toLowerCase().includes(q);
      const inSegments = p.segments.some((s) => s.text.toLowerCase().includes(q));
      return inTitle || inDoc || inSegments;
    }
    return true;
  });

  const handleDownloadAudio = async (e: React.MouseEvent, podcast: PodcastItem) => {
    e.stopPropagation();
    try {
      setDownloadingId(podcast.id);
      
      // Check if already in IndexedDB / OPFS
      let blob = await getAudioBlob(podcast.id);
      if (!blob) {
        blob = (await generatePodcastWav(podcast)).blob;
        await saveAudioBlob(podcast.id, blob);
      }

      downloadFile(blob, `${podcast.title.replace(/\s+/g, '_')}.wav`, 'audio/wav');
      setDownloadingId(null);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadingId(null);
    }
  };

  const handleExportMarkdown = (e: React.MouseEvent, podcast: PodcastItem) => {
    e.stopPropagation();
    const md = exportScriptAsMarkdown(podcast);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    downloadFile(blob, `${podcast.title.replace(/\s+/g, '_')}_Skript.md`, 'text/markdown');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="In Episoden & Transkripten suchen..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Alle ({podcasts.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              filter === 'favorites'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Favoriten ({podcasts.filter((p) => p.isFavorite).length})</span>
          </button>
        </div>
      </div>

      {/* Podcast List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-10 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
            <FileAudio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Keine Podcasts gefunden</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? 'Für deine Suchanfrage gibt es keine Treffer. Versuche andere Suchbegriffe.'
                : 'Lade ein Dokument hoch, um deinen ersten Offline-Audio-Podcast zu generieren.'}
            </p>
          </div>
          <button
            onClick={onNewPodcast}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md"
          >
            Dokument umwandeln
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPodcast(item)}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {item.flag && <span className="text-base">{item.flag}</span>}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                      {item.style}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      ~{Math.round(item.totalEstimatedSeconds / 60)} Min
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1 truncate">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    <span className="truncate">{item.documentName}</span>
                    <span>•</span>
                    <span className="shrink-0">{item.segments.length} Beiträge</span>
                    <span>•</span>
                    <span className="shrink-0">{new Date(item.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* G20 Translation button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTranslatingPodcast(item);
                  }}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
                  title="In G20-Sprache übersetzen"
                >
                  <Globe className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleDownloadAudio(e, item)}
                  disabled={downloadingId === item.id}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
                  title="WAV Audio herunterladen"
                >
                  {downloadingId === item.id ? (
                    <span className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={(e) => handleExportMarkdown(e, item)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
                  title="Skript als Markdown speichern"
                >
                  <FileText className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className={`p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-800 ${
                    item.isFavorite
                      ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Favorit"
                >
                  <Bookmark className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePodcast(item.id);
                  }}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all border border-slate-200 dark:border-slate-800"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* G20 Translation Modal for Library */}
      {translatingPodcast && (
        <G20TranslateModal
          isOpen={!!translatingPodcast}
          onClose={() => setTranslatingPodcast(null)}
          podcast={translatingPodcast}
          onTranslationComplete={(translated) => {
            onUpdatePodcast?.(translated);
            setTranslatingPodcast(null);
          }}
        />
      )}
    </div>
  );
};
