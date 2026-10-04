import React, { useState } from 'react';
import { G20Country, PodcastItem } from '../types/podcast';
import { G20_COUNTRIES } from '../data/g20Countries';
import { translatePodcastToG20 } from '../services/translationService';
import { Globe, X, Search, Sparkles, Check, ArrowRight } from 'lucide-react';

interface G20TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: PodcastItem;
  onTranslationComplete: (translatedPodcast: PodcastItem) => void;
}

export const G20TranslateModal: React.FC<G20TranslateModalProps> = ({
  isOpen,
  onClose,
  podcast,
  onTranslationComplete
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('en-US');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const filteredCountries = G20_COUNTRIES.filter((country) => {
    if (regionFilter !== 'all' && country.region !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = country.countryName.toLowerCase().includes(q);
      const inLang = country.langName.toLowerCase().includes(q);
      const inVar = country.variationLabel.toLowerCase().includes(q);
      return inName || inLang || inVar;
    }
    return true;
  });

  const selectedCountry = G20_COUNTRIES.find((c) => c.id === selectedCountryId) || G20_COUNTRIES[0];

  const handleStartTranslate = async () => {
    try {
      setIsTranslating(true);
      setProgress(10);

      const translated = await translatePodcastToG20(
        podcast,
        selectedCountry.id,
        (p) => setProgress(p)
      );

      setIsTranslating(false);
      onTranslationComplete(translated);
      onClose();
    } catch (err) {
      console.error('Translation error:', err);
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden transition-all">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 p-0.5 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                G20-Staaten Übersetzung
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Podcast in eine der 20 wichtigsten Wirtschaftssprachen & Dialekte lokalisieren
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                Ohne Übersetzungsserver arbeitet die lokale Engine: Gesprächsführung,
                Begrüßung und Moderatoren werden übersetzt — die Inhaltssätze bleiben in der
                Sprache des Dokuments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isTranslating}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="p-3 sm:p-4 space-y-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Land, Sprache oder Dialekt suchen (z. B. Japan, Français, Rioplatense)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            {[
              { id: 'all', label: 'Alle G20' },
              { id: 'Europe', label: 'Europa' },
              { id: 'Americas', label: 'Amerika' },
              { id: 'Asia-Pacific', label: 'Asien-Pazifik' },
              { id: 'Middle East & Africa', label: 'Nahost & Afrika' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRegionFilter(r.id)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  regionFilter === r.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px]">
          {filteredCountries.map((c) => {
            const isSelected = c.id === selectedCountryId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountryId(c.id)}
                disabled={isTranslating}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{c.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.countryName}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                    {c.langName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {c.variationLabel} • {c.defaultHostA} & {c.defaultHostB}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Translation Progress State */}
        {isTranslating && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-indigo-50/70 dark:bg-indigo-950/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                Übersetze Podcast nach {selectedCountry.countryName} ({selectedCountry.langName})...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              Ziel: {selectedCountry.countryName} ({selectedCountry.langName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isTranslating}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Abbrechen
            </button>

            <button
              onClick={handleStartTranslate}
              disabled={isTranslating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>In G20-Sprache übersetzen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
