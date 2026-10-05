/**
 * Robuste TTS-Engine basierend auf der Web Speech API (window.speechSynthesis)
 * mit nativer Unterstützung für zwei unterschiedliche Stimmen (Host A & Host B),
 * Satz-für-Satz Chunking gegen Browser-Timeouts & Wort-Abschneiden,
 * Garbage-Collection-Schutz und saubere Puffer-Verwaltung.
 */

import { TranscriptSegment, VoiceSettings } from '../types/podcast';
import { synthese, stimmeGeladen } from './piperEngine';

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegmentIndex: number;
  currentSegment: TranscriptSegment | null;
  progressPercent: number;
  availableVoices: SpeechSynthesisVoice[];
  /** Neuronale Stimme rechnet gerade (erster Satz braucht einen Moment) */
  isSynthesizing?: boolean;
  /** Klangquelle: Gerätestimmen oder neuronale Stimme vom Gerät */
  engine?: 'geraet' | 'piper';
  /** Grund, falls die neuronale Stimme nicht benutzt werden konnte */
  engineHinweis?: string;
}

export type TTSListener = (state: TTSState) => void;

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private segments: TranscriptSegment[] = [];
  private currentPodcastId: string | null = null;
  private currentIndex: number = 0;
  private currentSentenceIndex: number = 0;
  private currentSentences: string[] = [];
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private playbackRate: number = 1.0;
  private listeners: Set<TTSListener> = new Set();
  
  // Garbage-Collection Schutz: Verhindert, dass V8 aktive Utterances mitten im Satz abräumt
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private pendingTimer: any = null;
  private watchdogInterval: any = null;

  private settings: VoiceSettings = {
    hostAVoiceURI: '',
    hostAPitch: 0.90,
    hostARate: 1.0,
    hostBVoiceURI: '',
    hostBPitch: 1.22,
    hostBRate: 1.04,
    playbackRate: 1.0,
    engine: 'geraet',
    piperHostAVoice: '',
    piperHostBVoice: ''
  };

  // Neuronale Wiedergabe (Piper): fertige Sätze werden als Audiodatei zwischengespeichert,
  // damit Pause, Wiederholen und Suchen sofort reagieren.
  private piperAudio: HTMLAudioElement | null = null;
  private piperCache: Map<string, string> = new Map();
  private piperCacheReihenfolge: string[] = [];
  private piperFehler: boolean = false;
  private piperBusy: boolean = false;

  private readonly SPEICHER_KEY = 'docucast.voiceSettings';

  constructor() {
    this.ladeEinstellungen();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      
      if (this.synth.addEventListener) {
        this.synth.addEventListener('voiceschanged', () => this.initVoices());
      } else if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }

      // Asynchrone Voices-Abfragen für Chromium, Android und iOS Safari
      setTimeout(() => this.initVoices(), 150);
      setTimeout(() => this.initVoices(), 600);
      setTimeout(() => this.initVoices(), 1500);

      // Globaler Anker gegen V8 Garbage Collection
      (window as any).__docucastActiveUtterances = this.activeUtterances;
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const retrieved = this.synth.getVoices();
    if (retrieved && retrieved.length > 0) {
      this.voices = retrieved;
      this.autoAssignVoices('de');
      this.notify();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getVoiceSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateVoiceSettings(newSettings: Partial<VoiceSettings>) {
    const engineWechselt =
      newSettings.engine !== undefined && newSettings.engine !== this.settings.engine;

    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.playbackRate) {
      this.playbackRate = newSettings.playbackRate;
      if (this.piperAudio) {
        // Tempo wirkt sofort, auch mitten im Satz
        try {
          this.piperAudio.playbackRate = Math.max(0.5, Math.min(2.0, this.playbackRate));
        } catch {
          /* egal */
        }
      }
    }
    this.speichereEinstellungen();

    if (engineWechselt) {
      // Beim Wechsel der Klangquelle laufende Wiedergabe sauber beenden
      const warAmSpielen = this.isPlaying;
      this.stop();
      if (warAmSpielen) this.play();
    }
    this.notify();
  }

  public getEngine(): 'geraet' | 'piper' {
    return this.settings.engine === 'piper' ? 'piper' : 'geraet';
  }

  /** Aktuelle Stimmen-Einstellungen (Kopie) - für die Stimmen-Ansicht */
  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Wählt die Klangquelle. 'piper' nutzt die neuronalen Stimmen, die auf diesem
   * Gerät liegen (kein Text verlässt das Gerät), 'geraet' nutzt die Systemstimmen.
   */
  public setEngine(engine: 'geraet' | 'piper') {
    this.updateVoiceSettings({ engine });
  }

  public engineBereit(): boolean {
    return this.getEngine() === 'piper' && !this.piperFehler;
  }

  private aktuellePiperVoice(speaker: 'hostA' | 'hostB'): string {
    return (speaker === 'hostA' ? this.settings.piperHostAVoice : this.settings.piperHostBVoice) || '';
  }

  private speichereEinstellungen() {
    try {
      localStorage.setItem(this.SPEICHER_KEY, JSON.stringify(this.settings));
    } catch {
      /* Speicher nicht verfügbar - kein Beinbruch */
    }
  }

  private ladeEinstellungen() {
    try {
      const roh = localStorage.getItem(this.SPEICHER_KEY);
      if (roh) {
        const gelesen = JSON.parse(roh) as Partial<VoiceSettings>;
        this.settings = { ...this.settings, ...gelesen };
        this.playbackRate = this.settings.playbackRate || 1.0;
      }
    } catch {
      /* beschädigte Einstellungen ignorieren */
    }
  }

  /**
   * Intelligente Stimmenzuordnung:
   * Wenn Stimmen in der gewünschten Zielsprache vorhanden sind, werden diese bevorzugt.
   * Bei Sprachwechsel (z. B. G20-Übersetzung nach Englisch, Französisch, Japanisch)
   * werden die Stimmen automatisch auf passende Zielstimmen umgestellt.
   */
  public autoAssignVoices(preferredLang: string = 'de', forceReassign: boolean = true) {
    if (!this.voices || this.voices.length === 0) return;

    const langPrefix = preferredLang.toLowerCase().slice(0, 2);
    const langVoices = this.voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
    const pool = langVoices.length > 0 ? langVoices : this.voices;

    const currentVoiceA = this.voices.find((v) => v.voiceURI === this.settings.hostAVoiceURI);
    const currentVoiceMatches = currentVoiceA && currentVoiceA.lang.toLowerCase().startsWith(langPrefix);

    if (forceReassign || !currentVoiceMatches || !this.settings.hostAVoiceURI) {
      if (pool.length >= 2) {
        this.settings.hostAVoiceURI = pool[0].voiceURI;
        const secondVoice = pool.find((v) => v.voiceURI !== pool[0].voiceURI) || pool[1];
        this.settings.hostBVoiceURI = secondVoice.voiceURI;
        this.settings.hostAPitch = 0.92;
        this.settings.hostBPitch = 1.18;
        this.settings.hostARate = 1.0;
        this.settings.hostBRate = 1.03;
      } else if (pool.length === 1) {
        this.settings.hostAVoiceURI = pool[0].voiceURI;
        this.settings.hostBVoiceURI = pool[0].voiceURI;
        this.settings.hostAPitch = 0.88;
        this.settings.hostBPitch = 1.25;
        this.settings.hostARate = 0.98;
        this.settings.hostBRate = 1.05;
      }
    }
    this.notify();
  }

  public subscribe(listener: TTSListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public getState(): TTSState {
    const currentSegment = this.segments[this.currentIndex] || null;
    const progress = this.segments.length > 0 ? Math.round(((this.currentIndex) / this.segments.length) * 100) : 0;
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSegmentIndex: this.currentIndex,
      currentSegment,
      progressPercent: progress,
      availableVoices: this.voices,
      isSynthesizing: this.piperBusy,
      engine: this.getEngine(),
      engineHinweis: this.piperFehler ? 'Neuronale Stimme nicht verfügbar - Gerätestimme übernimmt.' : undefined
    };
  }

  public loadSegments(segments: TranscriptSegment[], podcastId?: string, startIndex = 0) {
    // Wenn derselbe Podcast bereits geladen ist und läuft, Wiedergabe nicht abbrechen!
    if (podcastId && this.currentPodcastId === podcastId && this.segments === segments && this.isPlaying) {
      return;
    }

    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentPodcastId = podcastId || null;
    this.segments = segments;
    this.currentIndex = Math.max(0, Math.min(startIndex, segments.length - 1));
    this.currentSentenceIndex = 0;
    this.currentSentences = [];
    this.notify();

    if (wasPlaying) {
      this.play();
    }
  }

  public play() {
    const neuronaleQuelle = this.getEngine() === 'piper';
    if ((!this.synth && !neuronaleQuelle) || this.segments.length === 0) return;

    // Neue Wiedergabe: nach einem Fehler darf die neuronale Stimme erneut antreten
    this.piperFehler = false;

    if (this.isPaused) {
      if (this.piperAudio) {
        this.isPaused = false;
        this.isPlaying = true;
        this.startWatchdog();
        this.piperAudio.play().catch(() => this.stoppePiperAudio());
        this.notify();
        return;
      }
      this.synth?.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.startWatchdog();
      this.notify();
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentSentenceIndex = 0;
    this.startWatchdog();
    this.speakCurrentSegment();
  }

  public pause() {
    this.clearPendingTimer();
    this.pausierePiperAudio();
    if (!this.synth) {
      this.isPaused = true;
      this.isPlaying = false;
      this.stopWatchdog();
      this.notify();
      return;
    }
    this.synth.pause();
    this.isPaused = true;
    this.isPlaying = false;
    this.stopWatchdog();
    this.notify();
  }

  public resume() {
    this.isPaused = false;
    this.isPlaying = true;

    if (this.piperAudio && !this.piperFehler) {
      this.startWatchdog();
      this.piperAudio.play().catch(() => this.stoppePiperAudio());
      this.notify();
      return;
    }

    if (!this.synth) {
      this.notify();
      return;
    }
    this.synth.resume();
    this.startWatchdog();
    this.notify();
  }

  public stop() {
    this.clearPendingTimer();
    this.stopWatchdog();
    this.stoppePiperAudio();
    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterances.clear();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSentenceIndex = 0;
    this.currentSentences = [];
    this.notify();
  }

  public jumpToSegment(index: number) {
    if (index < 0 || index >= this.segments.length) return;
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentIndex = index;
    this.currentSentenceIndex = 0;
    this.notify();
    if (wasPlaying) {
      this.play();
    }
  }

  public skipForward15s() {
    const jump = 3;
    const target = Math.min(this.segments.length - 1, this.currentIndex + jump);
    this.jumpToSegment(target);
  }

  public skipBackward15s() {
    const jump = 3;
    const target = Math.max(0, this.currentIndex - jump);
    this.jumpToSegment(target);
  }

  public setSpeed(rate: number) {
    this.playbackRate = rate;
    this.settings.playbackRate = rate;
    if (this.isPlaying && !this.isPaused) {
      const currentIdx = this.currentIndex;
      this.stop();
      this.currentIndex = currentIdx;
      this.play();
    } else {
      this.notify();
    }
  }

  /**
   * Teilt Text in saubere, natürlich sprechbare Einzelsätze auf,
   * schützt deutsche Abkürzungen und Zahlen vor falscher Trennung
   * und verhindert das 15s-Chrome-Timeout sowie Wort-Abschneiden.
   */
  private splitTextIntoSentences(text: string): string[] {
    let clean = text
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return [];

    // Häufige Abkürzungen temporär schützen
    const abbreviations: [RegExp, string][] = [
      [/\bz\.\s*B\./gi, 'z_B_PROTECTED'],
      [/\bd\.\s*h\./gi, 'd_h_PROTECTED'],
      [/\bu\.\s*a\./gi, 'u_a_PROTECTED'],
      [/\bbzw\./gi, 'bzw_PROTECTED'],
      [/\bca\./gi, 'ca_PROTECTED'],
      [/\bDr\./gi, 'Dr_PROTECTED'],
      [/\bProf\./gi, 'Prof_PROTECTED'],
      [/\bNr\./gi, 'Nr_PROTECTED'],
      [/\bAbb\./gi, 'Abb_PROTECTED'],
      [/\bAbs\./gi, 'Abs_PROTECTED'],
      [/\bvs\./gi, 'vs_PROTECTED'],
      [/\be\.g\./gi, 'eg_PROTECTED'],
      [/\bi\.e\./gi, 'ie_PROTECTED'],
      [/(\d+)\.(\d+)/g, '$1_DOT_$2']
    ];

    abbreviations.forEach(([regex, repl]) => {
      clean = clean.replace(regex, repl);
    });

    // Trenne an Satzzeichen (. ! ?) gefolgt von Leerzeichen, Anführungszeichen oder Zeilenende
    const rawMatches = clean.match(/[^.!?]+[.!?]+(["'„“»«\s]|$)|[^.!?]+$/g);
    const result = rawMatches && rawMatches.length > 0 ? rawMatches : [clean];

    return result
      .map((s) => {
        let restored = s.trim();
        abbreviations.forEach(([regex, repl]) => {
          if (repl === '$1_DOT_$2') {
            restored = restored.replace(/(\d+)_DOT_(\d+)/g, '$1.$2');
          } else {
            const orig = repl
              .replace('_PROTECTED', '.')
              .replace('z_B.', 'z. B.')
              .replace('d_h.', 'd. h.')
              .replace('u_a.', 'u. a.');
            restored = restored.split(repl).join(orig);
          }
        });
        return restored;
      })
      .filter((s) => s.length > 0);
  }

  private speakCurrentSegment() {
    if (this.currentIndex >= this.segments.length) {
      this.finishPlayback();
      return;
    }

    if (!this.synth && this.getEngine() !== 'piper') {
      this.finishPlayback();
      return;
    }

    const segment = this.segments[this.currentIndex];
    this.notify();

    // Sätze für das aktuelle Segment aufbereiten
    this.currentSentences = this.splitTextIntoSentences(segment.text);
    this.currentSentenceIndex = 0;

    // Falls der Browser noch eine alte Queue hält, sicherstellen dass er empfangsbereit ist
    if (this.synth?.speaking || this.synth?.pending) {
      this.synth.cancel();
      // Kurzer Tick nach cancel(), um Chrome-interne Race-Conditions zu vermeiden
      setTimeout(() => {
        if (this.isPlaying && !this.isPaused) {
          this.speakCurrentSentence();
        }
      }, 50);
    } else {
      this.speakCurrentSentence();
    }
  }

  private speakCurrentSentence() {
    if (!this.isPlaying || this.isPaused) return;

    // Wenn alle Sätze dieses Segments gesprochen wurden:
    if (this.currentSentenceIndex >= this.currentSentences.length) {
      this.advanceToNextSegment();
      return;
    }

    // Neuronale Stimme aus dem Gerätespeicher (Piper) - Text bleibt auf dem Gerät
    const aktuelleSprecher = this.segments[this.currentIndex]?.speaker;
    if (this.engineBereit() && aktuelleSprecher && this.aktuellePiperVoice(aktuelleSprecher)) {
      void this.speakCurrentSentencePiper();
      return;
    }

    if (!this.synth || !this.isPlaying || this.isPaused) return;

    const rawSentence = this.currentSentences[this.currentSentenceIndex];
    const segment = this.segments[this.currentIndex];
    const isHostA = segment.speaker === 'hostA';

    // Pufferung gegen das vorzeitige Abschneiden des vorletzten oder letzten Wortes:
    // Chrome feuert das onend-Event ab, sobald der Text-Parser fertig ist – die Audio-Hardware
    // spielt die letzten 300ms aber noch ab. Durch das Anhängen von ' ...' hält die TTS-Engine
    // eine natürliche Sprechpause, wodurch alle Wörter zu 100% vollständig ausgesprochen werden!
    const cleanSentence = rawSentence.trim();
    const hasPunctuation = /[.!?]$/.test(cleanSentence);
    const spokenText = hasPunctuation ? `${cleanSentence} ...` : `${cleanSentence}. ...`;

    const utterance = new SpeechSynthesisUtterance(spokenText);

    // Starke Referenz im Set halten gegen V8 Garbage Collection
    this.activeUtterances.add(utterance);

    // Stimme & Parameter konfigurieren
    const targetVoiceURI = isHostA ? this.settings.hostAVoiceURI : this.settings.hostBVoiceURI;
    const voice = this.voices.find((v) => v.voiceURI === targetVoiceURI) || this.voices[0];
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    const basePitch = isHostA ? this.settings.hostAPitch : this.settings.hostBPitch;
    utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch));

    const baseRate = isHostA ? this.settings.hostARate : this.settings.hostBRate;
    utterance.rate = Math.max(0.5, Math.min(2.0, baseRate * this.playbackRate));

    let hasEnded = false;

    // Utterance-spezifischer Watchdog: Falls Chrome festhängt und weder onstart noch onend feuert
    const safetyTimer = setTimeout(() => {
      if (!hasEnded && this.isPlaying && !this.isPaused && this.synth) {
        if (this.synth.paused) {
          this.synth.resume();
        }
      }
    }, 1500);

    const handleSentenceCompletion = () => {
      if (hasEnded) return;
      hasEnded = true;
      clearTimeout(safetyTimer);
      this.activeUtterances.delete(utterance);

      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIndex++;
        // Natürlicher Atemabstand (220ms) zwischen Sätzen desselben Sprechers
        this.clearPendingTimer();
        this.pendingTimer = setTimeout(() => {
          if (this.isPlaying && !this.isPaused) {
            this.speakCurrentSentence();
          }
        }, 220);
      }
    };

    utterance.onstart = () => {
      clearTimeout(safetyTimer);
    };

    utterance.onend = handleSentenceCompletion;

    utterance.onerror = (e) => {
      clearTimeout(safetyTimer);
      this.activeUtterances.delete(utterance);
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('TTS Sentence Error:', e);
      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIndex++;
        this.clearPendingTimer();
        this.pendingTimer = setTimeout(() => {
          if (this.isPlaying && !this.isPaused) {
            this.speakCurrentSentence();
          }
        }, 150);
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Synth speak error:', err);
    }
  }

  /* ---------------------- Neuronale Wiedergabe (Stimmen vom Gerät) ---------------------- */

  private pausierePiperAudio() {
    try {
      this.piperAudio?.pause();
    } catch {
      /* egal */
    }
  }

  private stoppePiperAudio() {
    if (!this.piperAudio) return;
    try {
      this.piperAudio.onended = null;
      this.piperAudio.onerror = null;
      this.piperAudio.pause();
      this.piperAudio.currentTime = 0;
    } catch {
      /* egal */
    }
    this.piperAudio = null;
  }

  /** Liefert die Audiodatei eines Satzes - fertige Sätze kommen aus dem Zwischenspeicher */
  private async piperUrl(text: string, voiceId: string): Promise<string> {
    const schluessel = `${voiceId}::${text}`;
    const vorhanden = this.piperCache.get(schluessel);
    if (vorhanden) return vorhanden;

    const blob = await synthese(text, voiceId);
    const url = URL.createObjectURL(blob);
    this.piperCache.set(schluessel, url);
    this.piperCacheReihenfolge.push(schluessel);

    // Zwischenspeicher begrenzen, älteste Aufnahme freigeben
    while (this.piperCacheReihenfolge.length > 240) {
      const alt = this.piperCacheReihenfolge.shift() as string;
      const alteUrl = this.piperCache.get(alt);
      if (alteUrl) URL.revokeObjectURL(alteUrl);
      this.piperCache.delete(alt);
    }
    return url;
  }

  /** Sprechfertiger Satz: klarer Satzschluss hilft der neuronalen Stimme beim Rhythmus */
  private piperSatzText(roh: string): string {
    const sauber = (roh || '').trim();
    if (!sauber) return '';
    return /[.!?:]$/.test(sauber) ? sauber : `${sauber}.`;
  }

  private async speakCurrentSentencePiper() {
    if (!this.isPlaying || this.isPaused) return;

    if (this.currentSentenceIndex >= this.currentSentences.length) {
      this.advanceToNextSegment();
      return;
    }

    const segment = this.segments[this.currentIndex];
    if (!segment) {
      this.finishPlayback();
      return;
    }

    const voiceId = this.aktuellePiperVoice(segment.speaker);
    if (!voiceId) {
      this.speakCurrentSentence();
      return;
    }

    const text = this.piperSatzText(this.currentSentences[this.currentSentenceIndex]);
    if (!text) {
      this.currentSentenceIndex++;
      void this.speakCurrentSentencePiper();
      return;
    }

    const liegtBereit = await stimmeGeladen(voiceId).catch(() => false);
    if (!liegtBereit) {
      // Stimme wurde inzwischen entfernt -> Gerätestimmen übernehmen
      this.speakCurrentSentence();
      return;
    }

    this.piperBusy = true;
    this.notify();

    let url: string;
    try {
      url = await this.piperUrl(text, voiceId);
    } catch (fehler) {
      this.piperBusy = false;
      console.warn('Neuronale Stimme nicht verfügbar, Gerätestimme übernimmt:', fehler);
      this.piperFehler = true;
      this.speakCurrentSentence();
      return;
    }

    this.piperBusy = false;
    if (!this.isPlaying || this.isPaused) return;

    const audio = new Audio(url);
    audio.playbackRate = Math.max(0.5, Math.min(2.0, this.playbackRate));
    this.piperAudio = audio;

    // Nächsten Satz im Hintergrund vorbereiten - so entsteht keine hörbare Lücke
    void this.bereiteNaechstenSatzVor();

    const weiter = () => {
      this.piperAudio = null;
      if (!this.isPlaying || this.isPaused) return;
      this.currentSentenceIndex++;
      this.notify();
      void this.speakCurrentSentencePiper();
    };
    audio.onended = weiter;
    audio.onerror = weiter;

    try {
      await audio.play();
    } catch {
      // Wiedergabe verweigert (z. B. fehlende Nutzeraktion) -> Gerätestimme übernimmt
      this.piperAudio = null;
      this.piperFehler = true;
      this.speakCurrentSentence();
    }
  }

  private async bereiteNaechstenSatzVor() {
    const segment = this.segments[this.currentIndex];
    if (!segment) return;
    const naechster = this.currentSentenceIndex + 1;
    if (naechster >= this.currentSentences.length) return;

    const voiceId = this.aktuellePiperVoice(segment.speaker);
    if (!voiceId) return;
    const text = this.piperSatzText(this.currentSentences[naechster]);
    if (!text) return;

    try {
      await this.piperUrl(text, voiceId);
    } catch {
      /* dann entsteht beim nächsten Satz eben eine kurze Pause */
    }
  }

  private advanceToNextSegment() {
    this.currentIndex++;
    this.currentSentenceIndex = 0;
    this.currentSentences = [];
    
    // UI sofort aktualisieren: Zeigt direkt den neuen Moderator und das neue Segment an!
    this.notify();

    if (this.currentIndex < this.segments.length) {
      // 380ms Pause zwischen verschiedenen Sprechern (Dialog-Dynamik)
      // Gibt der Soundkarte genug Zeit, den letzten Klang vollständig abzuschließen
      this.clearPendingTimer();
      this.pendingTimer = setTimeout(() => {
        if (this.isPlaying && !this.isPaused) {
          this.speakCurrentSegment();
        }
      }, 380);
    } else {
      // Letztes Segment des Podcasts wurde vollständig beendet
      this.finishPlayback();
    }
  }

  private finishPlayback() {
    // 700ms warten, damit das allerletzte Wort nicht durch State-Reset abgeschnitten wird
    this.clearPendingTimer();
    this.pendingTimer = setTimeout(() => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentIndex = 0;
      this.currentSentenceIndex = 0;
      this.currentSentences = [];
      this.stopWatchdog();
      this.activeUtterances.clear();
      this.notify();
    }, 700);
  }

  private clearPendingTimer() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  /**
   * Sicherer Watchdog: Greift nur ein, wenn die Synthese komplett hängen bleibt
   */
  private startWatchdog() {
    this.stopWatchdog();
    this.watchdogInterval = setInterval(() => {
      if (this.synth && this.isPlaying && !this.isPaused) {
        if (this.synth.paused) {
          this.synth.resume();
        }
      }
    }, 3500);
  }

  private stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }
}

export const ttsEngine = new TTSEngine();
