import React, { useState } from 'react';
import { TranscriptSegment, PodcastItem } from '../types/podcast';
import { Play, Edit3, Trash2, ArrowUpDown, Plus, Download, Save, Check } from 'lucide-react';
import { exportScriptAsMarkdown, exportScriptAsJSON, downloadFile } from '../services/audioExporter';

interface ScriptEditorProps {
  podcast: PodcastItem;
  onUpdateSegments: (newSegments: TranscriptSegment[]) => void;
  onStartPlayback: () => void;
  onSaveToLibrary: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  podcast,
  onUpdateSegments,
  onStartPlayback,
  onSaveToLibrary
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  // Extract active speaker names from the podcast
  const hostAName = podcast.segments.find((s) => s.speaker === 'hostA')?.speakerName || 'Alex';
  const hostBName = podcast.segments.find((s) => s.speaker === 'hostB')?.speakerName || 'Sam';

  const handleStartEdit = (seg: TranscriptSegment) => {
    setEditingId(seg.id);
    setEditText(seg.text);
  };

  const handleSaveEdit = (id: string) => {
    const updated = podcast.segments.map((seg) => {
      if (seg.id === id) {
        return {
          ...seg,
          text: editText,
          estimatedDuration: Math.max(2, Math.round(editText.split(/\s+/).filter(Boolean).length / 2.2))
        };
      }
      return seg;
    });
    onUpdateSegments(updated);
    setEditingId(null);
  };

  const handleToggleSpeaker = (id: string) => {
    const updated: TranscriptSegment[] = podcast.segments.map((seg) => {
      if (seg.id === id) {
        const nextSpeaker: 'hostA' | 'hostB' = seg.speaker === 'hostA' ? 'hostB' : 'hostA';
        const nextName = nextSpeaker === 'hostA' ? hostAName : hostBName;
        return {
          ...seg,
          speaker: nextSpeaker,
          speakerName: nextName
        };
      }
      return seg;
    });
    onUpdateSegments(updated);
  };

  const handleDeleteSegment = (id: string) => {
    const updated = podcast.segments.filter((s) => s.id !== id);
    onUpdateSegments(updated);
  };

  const handleAddSegment = (afterIndex: number) => {
    const prev = podcast.segments[afterIndex];
    const newSpeaker: 'hostA' | 'hostB' = prev ? (prev.speaker === 'hostA' ? 'hostB' : 'hostA') : 'hostA';
    const newName = newSpeaker === 'hostA' ? hostAName : hostBName;

    const newSeg: TranscriptSegment = {
      id: `seg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speaker: newSpeaker,
      speakerName: newName,
      text: 'Hier einen neuen Redebeitrag für die Sprecher einfügen...',
      estimatedDuration: 4
    };

    const nextList = [...podcast.segments];
    nextList.splice(afterIndex + 1, 0, newSeg);
    onUpdateSegments(nextList);
    setEditingId(newSeg.id);
    setEditText(newSeg.text);
  };

  const handleSaveClick = () => {
    onSaveToLibrary();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const totalWords = podcast.segments.reduce(
    (acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Script Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base truncate">{podcast.title}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{podcast.segments.length} Dialogzeilen</span>
            <span>•</span>
            <span>{totalWords} Wörter</span>
            <span>•</span>
            <span>~{Math.round(podcast.totalEstimatedSeconds / 60)} Min Audio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              savedNotification
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm'
            }`}
          >
            {savedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedNotification ? 'Gespeichert' : 'In Library sichern'}</span>
          </button>

          <button
            onClick={onStartPlayback}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Podcast abspielen</span>
          </button>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-3">
        {podcast.segments.map((seg, index) => {
          const isHostA = seg.speaker === 'hostA';
          const isEditing = editingId === seg.id;

          return (
            <div
              key={seg.id}
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                isHostA
                  ? 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-500/30 hover:border-sky-300 dark:hover:border-sky-500/50'
                  : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {/* Speaker indicator */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isHostA
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                    }`}
                  >
                    {isHostA ? 'A' : 'B'}
                  </div>
                  <span className={`text-xs font-bold ${isHostA ? 'text-sky-700 dark:text-sky-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {seg.speakerName} {isHostA ? '(Host A)' : '(Host B)'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">#{index + 1}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleSpeaker(seg.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] flex items-center gap-1 border border-slate-200 dark:border-slate-800"
                    title="Sprecher wechseln (Host A <-> Host B)"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden xs:inline">Wechseln</span>
                  </button>
                  <button
                    onClick={() => isEditing ? handleSaveEdit(seg.id) : handleStartEdit(seg)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] border border-slate-200 dark:border-slate-800"
                    title={isEditing ? 'Speichern' : 'Bearbeiten'}
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSegment(seg.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[10px] border border-slate-200 dark:border-slate-800"
                    title="Zeile entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text content or inline textarea */}
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleSaveEdit(seg.id)}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white shadow-sm"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {seg.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new segment button */}
      <button
        onClick={() => handleAddSegment(podcast.segments.length - 1)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-white dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Neuen Redebeitrag anfügen</span>
      </button>

      {/* Export Options */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800/80">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Skript-Export:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadFile(exportScriptAsMarkdown(podcast), `${podcast.title.replace(/\s+/g, '_')}_script.md`, 'text/markdown')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <Download className="w-3 h-3 text-sky-500 dark:text-sky-400" />
            <span>Markdown (.md)</span>
          </button>
          <button
            onClick={() => downloadFile(exportScriptAsJSON(podcast), `${podcast.title.replace(/\s+/g, '_')}_script.json`, 'application/json')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <Download className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>JSON (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
