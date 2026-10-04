import React, { useState, useEffect } from 'react';
import { PodcastConfig, PodcastStyle, ExtractedDocument } from '../types/podcast';
import { ttsEngine } from '../services/ttsEngine';
import { Sparkles, Mic, Volume2, Flame, Zap, HelpCircle, BookOpen, Sliders } from 'lucide-react';

interface GenerationSettingsProps {
  document: ExtractedDocument;
  onGenerate: (config: PodcastConfig) => void;
  isGenerating: boolean;
}

export const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  document,
  onGenerate,
  isGenerating
}) => {
  const [title, setTitle] = useState(
    document.name.replace(/\.(pdf|docx|txt|md)$/i, '') + ' - Podcast'
  );
  const [style, setStyle] = useState<PodcastStyle>('deep_dive');
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [hostAName, setHostAName] = useState('Alex');
  const [hostBName, setHostBName] = useState('Sam');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  // Voice setup from ttsEngine with reactive updates
  const initialSettings = ttsEngine.getVoiceSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(ttsEngine.getVoices());
  const [hostAVoice, setHostAVoice] = useState(initialSettings.hostAVoiceURI);
  const [hostBVoice, setHostBVoice] = useState(initialSettings.hostBVoiceURI);

  useEffect(() => {
    ttsEngine.autoAssignVoices(language);
    const updated = ttsEngine.getVoiceSettings();
    setHostAVoice(updated.hostAVoiceURI);
    setHostBVoice(updated.hostBVoiceURI);

    const unsub = ttsEngine.subscribe((state) => {
      setVoices(state.availableVoices);
      const s = ttsEngine.getVoiceSettings();
      if (!hostAVoice && s.hostAVoiceURI) setHostAVoice(s.hostAVoiceURI);
      if (!hostBVoice && s.hostBVoiceURI) setHostBVoice(s.hostBVoiceURI);
    });

    return () => unsub();
  }, [language]);

  const styleOptions: {
    id: PodcastStyle;
    title: string;
    description: string;
    duration: string;
    icon: any;
    badge: string;
  }[] = [
    {
      id: 'deep_dive',
      title: 'Deep Dive',
      description: 'Ausführliche Diskussion aller Kapitel mit Hintergrundanalyse und Details.',
      duration: '~5–8 Min',
      icon: Flame,
      badge: 'Empfohlen'
    },
    {
      id: 'tldr',
      title: 'Kompakt (TL;DR)',
      description: 'Rasantes Executive-Briefing mit den 3 wichtigsten Kernaussagen.',
      duration: '~2–3 Min',
      icon: Zap,
      badge: 'Schnell'
    },
    {
      id: 'interview',
      title: 'Experten-Interview',
      description: 'Alex stellt kritische Fragen, Sam antwortet fundiert aus dem Dokument.',
      duration: '~4–6 Min',
      icon: HelpCircle,
      badge: 'Dynamisch'
    },
    {
      id: 'storytelling',
      title: 'Diskussion & Story',
      description: 'Lockerer Gedankenaustausch mit Analogien und alltagsnahem Bezug.',
      duration: '~5–7 Min',
      icon: BookOpen,
      badge: 'Locker'
    }
  ];

  const handleTestVoice = (speaker: 'hostA' | 'hostB') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const isHostA = speaker === 'hostA';
    const text = isHostA
      ? (language === 'de' ? `Hi! Ich bin ${hostAName} und führe durch das Dokument.` : `Hello! I am ${hostAName} and I will moderate the podcast.`)
      : (language === 'de' ? `Und ich bin ${hostBName}! Ich fasse die Kernaussagen zusammen.` : `And I am ${hostBName}! I will break down the key insights.`);

    const utterance = new SpeechSynthesisUtterance(text);
    const targetURI = isHostA ? hostAVoice : hostBVoice;
    const voice = voices.find((v) => v.voiceURI === targetURI) || voices[0];
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    // Distinct pitch test
    utterance.pitch = isHostA ? 0.90 : 1.22;
    utterance.rate = isHostA ? 1.0 : 1.04;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceChange = (speaker: 'hostA' | 'hostB', uri: string) => {
    if (speaker === 'hostA') {
      setHostAVoice(uri);
      ttsEngine.updateVoiceSettings({ hostAVoiceURI: uri });
    } else {
      setHostBVoice(uri);
      ttsEngine.updateVoiceSettings({ hostBVoiceURI: uri });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hostAVoice || hostBVoice) {
      ttsEngine.updateVoiceSettings({
        hostAVoiceURI: hostAVoice,
        hostBVoiceURI: hostBVoice
      });
    }

    onGenerate({
      title,
      style,
      language,
      targetDurationMinutes: style === 'tldr' ? 3 : 6,
      hostAName,
      hostBName,
      hostARole: 'Moderator & Struktur',
      hostBRole: 'Analyst & Kernaussagen',
      generationMode: 'rule_based'
    });
  };

  // Filter voices to prefer matching language
  const langPrefix = language.toLowerCase().slice(0, 2);
  const relevantVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const displayVoices = relevantVoices.length > 0 ? relevantVoices : voices;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Podcast-Titel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900 dark:text-white font-medium transition-all shadow-sm"
          placeholder="Titel der Podcast-Folge"
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Format & Erzählstil
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {document.sections.length} Themenabschnitte erkannt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {styleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = style === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setStyle(opt.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all shadow-sm ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{opt.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sprecher & Stimmen-Konfiguration */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Zwei-Sprecher Setup (Dialog)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showVoiceSettings ? 'Optionen einklappen' : 'Stimmen anpassen'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Host A */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/80 border border-sky-200 dark:border-sky-500/30 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-sm" />
                Host A (Moderation)
              </span>
              <button
                type="button"
                onClick={() => handleTestVoice('hostA')}
                className="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-[11px] font-semibold flex items-center gap-1 border border-sky-200 dark:border-sky-500/20"
                title="Stimme testen"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test
              </button>
            </div>
            <input
              type="text"
              value={hostAName}
              onChange={(e) => setHostAName(e.target.value)}
              placeholder="Name Sprecher A"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
            {showVoiceSettings && (
              <select
                value={hostAVoice}
                onChange={(e) => handleVoiceChange('hostA', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200"
              >
                {displayVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Host B */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-500/30 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-sm" />
                Host B (Analyse & Co-Host)
              </span>
              <button
                type="button"
                onClick={() => handleTestVoice('hostB')}
                className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-[11px] font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-500/20"
                title="Stimme testen"
              >
                <Volume2 className="w-3.5 h-3.5" /> Test
              </button>
            </div>
            <input
              type="text"
              value={hostBName}
              onChange={(e) => setHostBName(e.target.value)}
              placeholder="Name Sprecher B"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
            {showVoiceSettings && (
              <select
                value={hostBVoice}
                onChange={(e) => handleVoiceChange('hostB', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200"
              >
                {displayVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 text-indigo-200" />
        {isGenerating ? 'Erstelle Dialog-Skript...' : 'Podcast-Dialog jetzt generieren'}
      </button>
    </form>
  );
};
