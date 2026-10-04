/**
 * DocuCast PWA - Mobile-First Dokument-zu-Podcast Progressive Web App
 * 100% Clientseitige Textextraktion, Dialogskripting & Sprachsynthese
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavigation, AppTab } from './components/BottomNavigation';
import { FileUploader } from './components/FileUploader';
import { GenerationSettings } from './components/GenerationSettings';
import { ScriptEditor } from './components/ScriptEditor';
import { PodcastPlayer } from './components/PodcastPlayer';
import { PodcastLibrary } from './components/PodcastLibrary';
import { ExtractedDocument, PodcastConfig, PodcastItem, TranscriptSegment } from './types/podcast';
import { generatePodcastScript } from './services/scriptGenerator';
import { savePodcast, getAllPodcasts, deletePodcast, toggleFavoritePodcast } from './services/storage';
import { ttsEngine, TTSState } from './services/ttsEngine';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { FileText, ArrowLeft, Headphones, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('upload');
  const [currentDocument, setCurrentDocument] = useState<ExtractedDocument | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<PodcastItem | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsState, setTtsState] = useState<TTSState>(ttsEngine.getState());
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('docucast_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const isOnline = useOnlineStatus();

  // Sync dark class on document element & meta theme-color
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
    }
    try {
      localStorage.setItem('docucast_theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [isDark]);

  // Load saved podcasts from IndexedDB on startup
  useEffect(() => {
    loadLibrary();
    const unsub = ttsEngine.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsub();
  }, []);

  const loadLibrary = async () => {
    try {
      const items = await getAllPodcasts();
      setPodcasts(items);
      // Auto-load latest podcast into player if none is active
      if (!currentPodcast && items.length > 0) {
        setCurrentPodcast(items[0]);
      }
    } catch (err) {
      console.warn('Fehler beim Laden der Bibliothek:', err);
    }
  };

  const handleDocumentExtracted = (doc: ExtractedDocument) => {
    setCurrentDocument(doc);
    setCurrentTab('settings');
  };

  const handleGenerateScript = async (config: PodcastConfig) => {
    if (!currentDocument) return;
    try {
      setIsGenerating(true);
      const segments = await generatePodcastScript(currentDocument, config);

      const totalDuration = segments.reduce((sum, s) => sum + s.estimatedDuration, 0);

      const newPodcast: PodcastItem = {
        id: `pod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: config.title,
        documentName: currentDocument.name,
        documentSize: currentDocument.size,
        wordCount: currentDocument.wordCount,
        style: config.style,
        segments,
        totalEstimatedSeconds: totalDuration,
        createdAt: Date.now(),
        isFavorite: false
      };

      // Persist in IndexedDB immediately
      await savePodcast(newPodcast);
      setCurrentPodcast(newPodcast);
      await loadLibrary();

      setIsGenerating(false);
      setCurrentTab('script');
    } catch (err: any) {
      console.error('Generierungsfehler:', err);
      setIsGenerating(false);
      alert('Podcast-Skript konnte nicht generiert werden: ' + (err.message || 'Unbekannter Fehler'));
    }
  };

  const handleUpdateSegments = async (newSegments: TranscriptSegment[]) => {
    if (!currentPodcast) return;
    const totalDuration = newSegments.reduce((sum, s) => sum + s.estimatedDuration, 0);
    const updated: PodcastItem = {
      ...currentPodcast,
      segments: newSegments,
      totalEstimatedSeconds: totalDuration
    };
    setCurrentPodcast(updated);
    ttsEngine.loadSegments(newSegments, updated.id);
    await savePodcast(updated);
    await loadLibrary();
  };

  const handleStartPlayback = () => {
    if (currentPodcast) {
      ttsEngine.loadSegments(currentPodcast.segments, currentPodcast.id);
    }
    setCurrentTab('player');
    setTimeout(() => {
      ttsEngine.play();
    }, 150);
  };

  const handleSaveToLibrary = async () => {
    if (currentPodcast) {
      await savePodcast(currentPodcast);
      await loadLibrary();
    }
  };

  const handleSelectPodcastFromLibrary = (item: PodcastItem) => {
    setCurrentPodcast(item);
    ttsEngine.loadSegments(item.segments, item.id);
    setCurrentTab('player');
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoritePodcast(id);
    await loadLibrary();
    if (currentPodcast && currentPodcast.id === id) {
      setCurrentPodcast({
        ...currentPodcast,
        isFavorite: !currentPodcast.isFavorite
      });
    }
  };

  const handleDeletePodcast = async (id: string) => {
    if (confirm('Möchtest du diesen Podcast wirklich löschen?')) {
      await deletePodcast(id);
      if (currentPodcast?.id === id) {
        setCurrentPodcast(null);
      }
      await loadLibrary();
    }
  };

  const handleNewPodcast = () => {
    setCurrentDocument(null);
    setCurrentTab('upload');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-24 transition-colors">
      {/* Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        activePodcastTitle={currentPodcast?.title}
        onOpenPlayer={() => setCurrentTab('player')}
        isPlaying={ttsState.isPlaying}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Offline notice bar if offline */}
        {!isOnline && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
              Offline-Modus aktiv: Die gesamte Textextraktion und Sprachsynthese läuft lokal im Browser.
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-500/20 text-[10px] font-bold">100% Client-Only</span>
          </div>
        )}

        {/* Tab 1: Upload */}
        {currentTab === 'upload' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dokument in Podcast verwandeln
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Wähle eine PDF- oder Word-Datei. Die Analyse und Dialog-Synthese erfolgt zu 100% lokal auf deinem Gerät.
              </p>
            </div>

            <FileUploader
              onDocumentExtracted={handleDocumentExtracted}
              isProcessing={false}
            />

            {/* Privacy & Offline Guarantee Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">Volle Privatsphäre & Datenschutz</strong>
                Deine Dokumente verlassen niemals diesen Browser. Keine externen API-Aufrufe, keine Server-Übertragung. Alle Audios werden in der lokalen IndexedDB deines Geräts gespeichert.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings (Document extracted, configuring podcast) */}
        {currentTab === 'settings' && currentDocument && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentTab('upload')}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anderes Dokument wählen</span>
              </button>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                {currentDocument.name} ({(currentDocument.size / 1024).toFixed(0)} KB)
              </span>
            </div>

            <div className="text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Podcast-Format & Stimmen wählen
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Wähle den Erzählstil und passe die beiden Sprecher (Host A & Host B) nach deinen Wünschen an.
              </p>
            </div>

            <GenerationSettings
              document={currentDocument}
              onGenerate={handleGenerateScript}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* Tab 3: Script Editor */}
        {currentTab === 'script' && currentPodcast && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentTab('settings')}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Einstellungen</span>
              </button>

              <button
                onClick={handleStartPlayback}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold shadow-sm transition-all"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Zum Player</span>
              </button>
            </div>

            <ScriptEditor
              podcast={currentPodcast}
              onUpdateSegments={handleUpdateSegments}
              onStartPlayback={handleStartPlayback}
              onSaveToLibrary={handleSaveToLibrary}
            />
          </div>
        )}

        {/* Tab 4: Player */}
        {currentTab === 'player' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {currentPodcast ? (
              <PodcastPlayer
                podcast={currentPodcast}
                isFavorite={currentPodcast.isFavorite}
                onSaveFavorite={handleToggleFavorite}
              />
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center space-y-3 shadow-sm">
                <Headphones className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Kein aktiver Podcast geladen</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Lade ein Dokument hoch oder wähle eine gespeicherte Episode aus deiner Bibliothek aus.
                </p>
                <button
                  onClick={() => setCurrentTab('upload')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 transition-all"
                >
                  Neuen Podcast erstellen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Library */}
        {currentTab === 'library' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Deine Podcast-Bibliothek
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Offline in IndexedDB & OPFS auf diesem Gerät gespeicherte Folgen
                </p>
              </div>
              <button
                onClick={handleNewPodcast}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                + Neu
              </button>
            </div>

            <PodcastLibrary
              podcasts={podcasts}
              onSelectPodcast={handleSelectPodcastFromLibrary}
              onToggleFavorite={handleToggleFavorite}
              onDeletePodcast={handleDeletePodcast}
              onNewPodcast={handleNewPodcast}
            />
          </div>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        hasDocument={!!currentDocument}
        hasScript={!!currentPodcast}
        isPlaying={ttsState.isPlaying}
      />
    </div>
  );
}
