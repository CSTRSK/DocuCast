/**
 * Stimmen-Verwaltung: fertige neuronale Stimmen aufs Gerät laden ODER eigene Stimme mitbringen.
 *
 * Zwei Wege, wie vom Betreiber gewünscht:
 *  - "Auf dieses Gerät laden": die Stimme wird einmalig geholt (bevorzugt vom eigenen
 *    Server, Hugging Face nur als Rückfall) und danach offline genutzt.
 *  - "Eigene Stimme mitbringen": eigene Piper-Dateien (.onnx + .onnx.json) hochladen.
 *
 * In beiden Fällen bleibt der Text auf dem Gerät - gesprochen wird lokal.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Smartphone,
  Cpu,
  Download,
  Trash2,
  Check,
  Loader2,
  Play,
  Upload,
  HardDrive,
  Info,
  Sparkles
} from 'lucide-react';
import { alleSprachen, voicesFuerSprache, empfehlungen } from '../data/piperVoices';
import {
  stimmeLaden,
  stimmeLoeschen,
  geladeneStimmen,
  speicherInfo,
  eigeneStimmen,
  eigeneStimmeImportieren,
  synthese,
  type EigeneStimme
} from '../services/piperEngine';
import { selbstTest } from '../services/piperEngine';
import { ttsEngine } from '../services/ttsEngine';

const QUALITAET_LABEL: Record<string, string> = {
  x_low: 'klein & schnell',
  low: 'kompakt',
  medium: 'gute Qualität',
  high: 'höchste Qualität'
};

/** Ort, an dem die fertigen Stimmen-Dateien zum Herunterladen bereitliegen */
const STIMMEN_QUELLE = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main/';
const STIMMEN_UEBERSICHT = 'https://huggingface.co/diffusionstudio/piper-voices/tree/main';

const SPRACH_LABEL: Record<string, string> = {
  de_DE: 'Deutsch',
  en_GB: 'Englisch (UK)',
  en_US: 'Englisch (US)',
  es_ES: 'Spanisch (Spanien)',
  es_MX: 'Spanisch (Mexiko)',
  es_AR: 'Spanisch (Argentinien)',
  fr_FR: 'Französisch',
  it_IT: 'Italienisch',
  pt_BR: 'Portugiesisch (Brasilien)',
  pt_PT: 'Portugiesisch',
  nl_NL: 'Niederländisch',
  pl_PL: 'Polnisch',
  ru_RU: 'Russisch',
  tr_TR: 'Türkisch',
  ar_JO: 'Arabisch',
  hi_IN: 'Hindi',
  ja_JP: 'Japanisch',
  ko_KR: 'Koreanisch',
  zh_CN: 'Chinesisch',
  id_ID: 'Indonesisch'
};

export const VoiceManager: React.FC = () => {
  const [engine, setEngine] = useState<'geraet' | 'piper'>(ttsEngine.getEngine());
  const [sprache, setSprache] = useState('de_DE');
  const [geladen, setGeladen] = useState<string[]>([]);
  const [eigene, setEigene] = useState<EigeneStimme[]>([]);
  const [fortschritt, setFortschritt] = useState<Record<string, number>>({});
  const [speicher, setSpeicher] = useState({ belegtMb: 0, kontingentMb: 0 });
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [testLaeuft, setTestLaeuft] = useState<string | null>(null);
  const [zeigeAlte, setZeigeAlte] = useState(false);
  /** Ergebnis der Prüfung nach dem Laden: 'ok' | 'fehler' (bleibt auf dem Gerät gespeichert) */
  const [pruefung, setPruefung] = useState<Record<string, 'ok' | 'fehler'>>(() => {
    try {
      return JSON.parse(localStorage.getItem('docucast.stimmenPruefung') || '{}');
    } catch {
      return {};
    }
  });
  const [zuweisung, setZuweisung] = useState<{ a: string; b: string }>({
    a: (ttsEngine.getSettings().piperHostAVoice as string) || '',
    b: (ttsEngine.getSettings().piperHostBVoice as string) || ''
  });
  const testAudio = useRef<HTMLAudioElement | null>(null);
  const modellFeld = useRef<HTMLInputElement | null>(null);
  const konfigFeld = useRef<HTMLInputElement | null>(null);
  const eigeneRef = useRef<HTMLElement | null>(null);

  const sprachen = useMemo(
    () =>
      alleSprachen().sort((a, b) => {
        const rang = (l: string) => (l === 'de_DE' ? 0 : l.startsWith('en') ? 1 : 2);
        return rang(a.lang) - rang(b.lang) || a.langName.localeCompare(b.langName);
      }),
    []
  );

  const stimmen = useMemo(
    () => voicesFuerSprache(sprache).filter((v) => (zeigeAlte ? true : v.modern)),
    [sprache, zeigeAlte]
  );
  const empf = useMemo(() => empfehlungen(sprache), [sprache]);

  /** Fertige Stimmen-Dateien dieser Sprache zum Herunterladen (für "eigene Stimme mitbringen") */
  const dateiLinks = useMemo(
    () =>
      voicesFuerSprache(sprache)
        .filter((v) => v.modern)
        .sort((a, b) => (a.quality === 'medium' ? 0 : 1) - (b.quality === 'medium' ? 0 : 1) || a.mb - b.mb)
        .slice(0, 4),
    [sprache]
  );

  const aktualisiere = useCallback(async () => {
    const [ids, info] = await Promise.all([geladeneStimmen(), speicherInfo()]);
    setGeladen(ids.filter((id) => !id.startsWith('eigen-')));
    setEigene(eigeneStimmen());
    setSpeicher(info);
  }, []);

  useEffect(() => {
    void aktualisiere();
  }, [aktualisiere]);

  const lade = async (id: string) => {
    setFehler(null);
    setMeldung(null);
    setFortschritt((f) => ({ ...f, [id]: 1 }));
    try {
      await stimmeLaden(id, (p) => {
        const prozent = p.gesamt > 0 ? Math.round((p.geladen / p.gesamt) * 100) : 0;
        setFortschritt((f) => ({ ...f, [id]: Math.max(1, prozent) }));
      });
      await aktualisiere();

      // Prüfen, ob die Stimme mit der heutigen Aussprache-Laufzeit zusammenspielt.
      // Stimmen der ersten Piper-Generation (130 Phoneme) tun das nicht - das fällt
      // hier sofort auf, statt später beim Abspielen.
      setMeldung('Stimme wird geprüft …');
      const test = await selbstTest(id);
      const ergebnis: 'ok' | 'fehler' = test.ok ? 'ok' : 'fehler';
      const neuePruefung = { ...pruefung, [id]: ergebnis };
      setPruefung(neuePruefung);
      try {
        localStorage.setItem('docucast.stimmenPruefung', JSON.stringify(neuePruefung));
      } catch {
        /* egal */
      }

      if (test.ok) {
        setMeldung(`Stimme liegt auf diesem Gerät und ist geprüft (${test.ms} ms für einen Testsatz).`);
      } else {
        setMeldung(null);
        setFehler(
          'Diese Stimme stammt aus der ersten Generation von Piper und passt nicht zur heutigen Aussprache. ' +
            'Sie bleibt gespeichert, wird aber nicht benutzt – bitte eine andere Stimme wählen.'
        );
      }
      // Sinnvolle Vorbelegung: erste geladene Stimme wird Sprecher A
      const settings = ttsEngine.getSettings();
      if (test.ok && !settings.piperHostAVoice) {
        ttsEngine.updateVoiceSettings({ piperHostAVoice: id, engine: 'piper' });
        setZuweisung((z) => ({ ...z, a: id }));
        setEngine('piper');
      }
    } catch (e: any) {
      setFehler(String(e?.message || e));
    } finally {
      setFortschritt((f) => {
        const kopie = { ...f };
        delete kopie[id];
        return kopie;
      });
    }
  };

  const entferne = async (id: string) => {
    await stimmeLoeschen(id);
    const settings = ttsEngine.getSettings();
    const neu: Record<string, string> = {};
    if (settings.piperHostAVoice === id) {
      neu.piperHostAVoice = '';
      setZuweisung((z) => ({ ...z, a: '' }));
    }
    if (settings.piperHostBVoice === id) {
      neu.piperHostBVoice = '';
      setZuweisung((z) => ({ ...z, b: '' }));
    }
    if (Object.keys(neu).length) ttsEngine.updateVoiceSettings(neu);
    await aktualisiere();
    setMeldung('Stimme vom Gerät entfernt.');
  };

  const teste = async (id: string) => {
    setFehler(null);
    setTestLaeuft(id);
    try {
      const blob = await synthese('Willkommen bei DocuCast. So klingt diese Stimme.', id);
      testAudio.current?.pause();
      const audio = new Audio(URL.createObjectURL(blob));
      testAudio.current = audio;
      void audio.play();
    } catch (e: any) {
      setFehler(`Test fehlgeschlagen: ${String(e?.message || e)}`);
    } finally {
      setTestLaeuft(null);
    }
  };

  const weiseZu = (sprecher: 'a' | 'b', id: string) => {
    const feld = sprecher === 'a' ? 'piperHostAVoice' : 'piperHostBVoice';
    ttsEngine.updateVoiceSettings({ [feld]: id, engine: 'piper' });
    setZuweisung((z) => ({ ...z, [sprecher]: id }));
    setEngine('piper');
    setMeldung(sprecher === 'a' ? 'Sprecher A spricht mit dieser Stimme.' : 'Sprecher B spricht mit dieser Stimme.');
  };

  const eigeneHinzufuegen = async () => {
    setFehler(null);
    const modell = modellFeld.current?.files?.[0];
    const konfig = konfigFeld.current?.files?.[0];
    if (!modell || !konfig) {
      setFehler('Bitte beide Dateien wählen: die .onnx-Datei und die .onnx.json.');
      return;
    }
    try {
      const eintrag = await eigeneStimmeImportieren(modell, konfig, modell.name.replace(/\.onnx$/i, ''));
      await aktualisiere();

      // Sofort prüfen: falsch zusammengestellte Dateien fallen hier auf und nicht erst beim Abspielen.
      const test = await selbstTest(eintrag.id);
      const neuePruefung = { ...pruefung, [eintrag.id]: (test.ok ? 'ok' : 'fehler') as 'ok' | 'fehler' };
      setPruefung(neuePruefung);
      try {
        localStorage.setItem('docucast.stimmenPruefung', JSON.stringify(neuePruefung));
      } catch {
        /* egal */
      }

      if (test.ok) {
        setMeldung(`Eigene Stimme "${eintrag.name}" liegt auf diesem Gerät und ist geprüft.`);
        if (!ttsEngine.getSettings().piperHostAVoice) {
          ttsEngine.updateVoiceSettings({ piperHostAVoice: eintrag.id, engine: 'piper' });
          setZuweisung((z) => ({ ...z, a: eintrag.id }));
          setEngine('piper');
        }
      } else {
        setFehler(
          'Die Dateien wurden übernommen, die Stimme lässt sich aber nicht verwenden. ' +
            'Meist passt die .onnx.json nicht zur .onnx-Datei.'
        );
        return;
      }
      if (modellFeld.current) modellFeld.current.value = '';
      if (konfigFeld.current) konfigFeld.current.value = '';
    } catch (e: any) {
      setFehler(String(e?.message || e));
    }
  };

  const waehleEngine = (neu: 'geraet' | 'piper') => {
    ttsEngine.setEngine(neu);
    setEngine(neu);
  };

  const prozent = (id: string) => fortschritt[id];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Stimmen</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gesprochen wird immer auf deinem Gerät – dein Dokument wird nie hochgeladen.
        </p>
      </header>

      {/* Klangquelle */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => waehleEngine('geraet')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            engine === 'geraet'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Smartphone className="w-5 h-5 mb-2 text-indigo-600 dark:text-indigo-400" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Gerätestimmen</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Sofort startklar, kein Download. Klang je nach Gerät.
          </div>
          {engine === 'geraet' && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <Check className="w-3 h-3" /> aktiv
            </div>
          )}
        </button>

        <button
          onClick={() => waehleEngine('piper')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            engine === 'piper'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Cpu className="w-5 h-5 mb-2 text-indigo-600 dark:text-indigo-400" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Neuronale Stimmen</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Natürlicher Klang, einmal laden, danach offline.
          </div>
          {engine === 'piper' && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <Check className="w-3 h-3" /> aktiv
            </div>
          )}
        </button>
      </section>

      <button
        onClick={() => eigeneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="w-full text-[11px] text-indigo-600 dark:text-indigo-400 underline decoration-dotted text-left"
      >
        Oder eigene .onnx-Datei mitbringen (Weiter unten, mit Download-Links) →
      </button>

      {engine === 'piper' && (
        <>
          {/* Belegung der Sprecher */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Wer spricht
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">Sprecher A</span>
              <span className={`font-mono text-[12px] ${zuweisung.a ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {zuweisung.a || 'nicht gewählt'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">Sprecher B</span>
              <span className={`font-mono text-[12px] ${zuweisung.b ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {zuweisung.b || 'nicht gewählt'}
              </span>
            </div>
            {!zuweisung.b && geladen.length + eigene.length >= 2 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tipp: zwei verschiedene Stimmen machen den Dialog lebendig – zum Beispiel eine weibliche
                und eine männliche.
              </p>
            )}
          </section>

          {/* Sprache */}
          <section className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Sprache
            </label>
            <select
              value={sprache}
              onChange={(e) => setSprache(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            >
              {sprachen.map((s) => (
                <option key={s.lang} value={s.lang}>
                  {(SPRACH_LABEL[s.lang] || s.langName) + ` (${s.anzahl})`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stimmen.length} Stimmen verfügbar – der Download läuft nur einmal.
            </p>
            <label className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={zeigeAlte}
                onChange={(e) => setZeigeAlte(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 accent-indigo-600"
              />
              <span>Auch Stimmen der ersten Generation anzeigen (kleiner, aber meist nicht nutzbar)</span>
            </label>
          </section>

          {/* Empfehlung */}
          {empf.leicht && (
            <section className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 p-3 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                Empfehlung für diese Sprache
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200">
                {empf.beste
                  ? `Beste Qualität: ${empf.beste.stimmName} (${empf.beste.mb} MB)`
                  : ''}
                {empf.leicht && empf.beste && empf.leicht.id !== empf.beste.id
                  ? ` · Sparsam: ${empf.leicht.stimmName} (${empf.leicht.mb} MB)`
                  : ''}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Tipp: für zwei Sprecher zwei verschiedene Stimmen wählen – zum Beispiel
                thorsten-medium und thorsten_emotional-medium.
              </p>
            </section>
          )}

          {/* Stimmenliste */}
          <section className="space-y-2">
            {stimmen.map((v) => {
              const istGeladen = geladen.includes(v.id);
              const laeuft = prozent(v.id);
              return (
                <div
                  key={v.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {v.stimmName}
                        {v.sprecher > 1 && (
                          <span className="ml-2 text-[10px] font-medium text-slate-500">
                            {v.sprecher} Sprecher im Modell
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {QUALITAET_LABEL[v.quality] || v.quality}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{v.mb} MB</span>
                        {!v.modern && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            erste Generation
                          </span>
                        )}
                        {pruefung[v.id] === 'ok' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            geprüft
                          </span>
                        )}
                        {pruefung[v.id] === 'fehler' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            auf diesem Gerät nicht nutzbar
                          </span>
                        )}
                      </div>
                    </div>
                    {istGeladen ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" /> auf dem Gerät
                      </span>
                    ) : null}
                  </div>

                  {laeuft !== undefined ? (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all"
                          style={{ width: `${laeuft}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        wird geladen … {laeuft}%
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {!istGeladen ? (
                        <button
                          onClick={() => void lade(v.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                        >
                          <Download className="w-3.5 h-3.5" /> Auf dieses Gerät laden
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => void teste(v.id)}
                            disabled={testLaeuft === v.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold disabled:opacity-60"
                          >
                            {testLaeuft === v.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            Anhören
                          </button>
                          <button
                            onClick={() => weiseZu('a', v.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              zuweisung.a === v.id
                                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Sprecher A
                          </button>
                          <button
                            onClick={() => weiseZu('b', v.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              zuweisung.b === v.id
                                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Sprecher B
                          </button>
                          <button
                            onClick={() => void entferne(v.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Entfernen
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* Eigene Stimme mitbringen */}
      <section ref={eigeneRef} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Eigene Stimme mitbringen
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          Du hast eine eigene Piper-Stimme (oder eine andere aus dem Netz)? Lade die Modelldatei
          <span className="font-mono"> .onnx</span> und die zugehörige
          <span className="font-mono"> .onnx.json</span> hoch. Beide bleiben auf deinem Gerät.
        </p>

        {/* Fertige Dateien zum Herunterladen */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Datei besorgen – fertige Links
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Immer <span className="font-bold">beide</span> Dateien holen: das Modell (Endung
            <span className="font-mono"> .onnx</span>) und die Konfiguration
            <span className="font-mono"> .onnx.json</span>. Die Namen gehören zusammen.
          </p>
          <div className="space-y-2">
            {dateiLinks.map((v) => (
              <div key={v.id} className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {(SPRACH_LABEL[sprache] || v.langName) + ' · ' + v.stimmName + ` (${v.mb} MB)`}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                  <a
                    href={`${STIMMEN_QUELLE}${v.path}?download=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline decoration-dotted"
                  >
                    Modell (.onnx) herunterladen
                  </a>
                  <a
                    href={`${STIMMEN_QUELLE}${v.path}.json?download=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline decoration-dotted"
                  >
                    Konfiguration (.onnx.json) herunterladen
                  </a>
                </div>
              </div>
            ))}
          </div>
          <a
            href={STIMMEN_UEBERSICHT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] text-indigo-600 dark:text-indigo-400 underline decoration-dotted"
          >
            Alle Sprachen und Stimmen ansehen (über 170 Stimmen)
          </a>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input
            ref={modellFeld}
            type="file"
            accept=".onnx"
            className="block w-full text-[12px] text-slate-600 dark:text-slate-300 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-xs file:font-bold"
          />
          <input
            ref={konfigFeld}
            type="file"
            accept=".json"
            className="block w-full text-[12px] text-slate-600 dark:text-slate-300 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-xs file:font-bold"
          />
          <button
            onClick={() => void eigeneHinzufuegen()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Stimme hinzufügen
          </button>
        </div>

        {eigene.length > 0 && (
          <div className="space-y-2 pt-1">
            {eigene.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {s.groesseMb} MB · eigene Datei
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => void teste(s.id)}
                    disabled={testLaeuft === s.id}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    Anhören
                  </button>
                  <button
                    onClick={() => weiseZu('a', s.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
                      zuweisung.a === s.id
                        ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => weiseZu('b', s.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
                      zuweisung.b === s.id
                        ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => void entferne(s.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500"
                    aria-label="Eigene Stimme entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Speicher + Hinweise */}
      <section className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-3 space-y-2">
        <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
          <HardDrive className="w-3.5 h-3.5" />
          Stimmen belegen {speicher.belegtMb.toFixed(1)} MB auf diesem Gerät
          {speicher.kontingentMb > 0 && ` (verfügbar: ${(speicher.kontingentMb / 1024).toFixed(1)} GB)`}
        </div>
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p className="leading-snug">
            Stimmen kommen von Piper (MIT-Lizenz). Sie werden einmalig geholt – bevorzugt von unserem
            eigenen Server – und danach aus dem Gerätespeicher benutzt. Es wird kein Text übertragen.
          </p>
        </div>
      </section>

      {meldung && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-[12px] text-emerald-800 dark:text-emerald-300">
          {meldung}
        </div>
      )}
      {fehler && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-900/20 p-3 text-[12px] text-rose-800 dark:text-rose-300">
          {fehler}
        </div>
      )}
    </div>
  );
};

export default VoiceManager;
