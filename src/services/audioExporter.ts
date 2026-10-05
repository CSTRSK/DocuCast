/**
 * Export- und Audio-Synthese-Dienst:
 * Erstellt Skript-Exporte (Markdown/JSON) und generiert clientseitig
 * portable Audio-Dateien (WAV) via Web Audio API.
 */

import { PodcastItem } from '../types/podcast';
import { synthese, stimmeGeladen } from './piperEngine';
import { ttsEngine } from './ttsEngine';

/* ---------------------------------------------------------------------------------------------
 * Echter Audio-Export mit den neuronalen Stimmen vom Gerät.
 *
 * Die bisherige WAV-Datei war nur eine Tonkontur (der Browser kann Systemstimmen nicht
 * mitschneiden). Mit den neuronalen Stimmen entsteht echtes gesprochenes Audio - die Sätze
 * werden auf dem Gerät erzeugt, hintereinandergelegt und als WAV gespeichert.
 * ------------------------------------------------------------------------------------------- */

const ZIEL_RATE = 22050;
const PAUSE_ABSCHNITT = 0.45;   // Sekunden zwischen zwei Beiträgen
const PAUSE_SPRECHERWECHSEL = 0.7;

/** Liest eine WAV-Datei (16-Bit-PCM) in Rohwerte ein */
async function wavZuSamples(blob: Blob): Promise<{ rate: number; daten: Float32Array }> {
  const puffer = await blob.arrayBuffer();
  const sicht = new DataView(puffer);

  if (sicht.byteLength < 44) throw new Error('Audiodatei ist unvollständig.');

  // Chunks durchlaufen (fmt + data)
  let offset = 12;
  let rate = ZIEL_RATE;
  let kanaele = 1;
  let bits = 16;
  let datenStart = -1;
  let datenLaenge = 0;

  while (offset + 8 <= sicht.byteLength) {
    const id = String.fromCharCode(
      sicht.getUint8(offset),
      sicht.getUint8(offset + 1),
      sicht.getUint8(offset + 2),
      sicht.getUint8(offset + 3)
    );
    const groesse = sicht.getUint32(offset + 4, true);
    const inhalt = offset + 8;

    if (id === 'fmt ') {
      kanaele = sicht.getUint16(inhalt + 2, true) || 1;
      rate = sicht.getUint32(inhalt + 4, true) || ZIEL_RATE;
      bits = sicht.getUint16(inhalt + 14, true) || 16;
    } else if (id === 'data') {
      datenStart = inhalt;
      datenLaenge = Math.min(groesse, sicht.byteLength - inhalt);
      break;
    }
    offset = inhalt + groesse + (groesse % 2);
  }

  if (datenStart < 0) throw new Error('Keine Audiodaten gefunden.');
  if (bits !== 16) throw new Error(`Nur 16-Bit-Audio wird unterstützt (gefunden: ${bits} Bit).`);

  const anzahl = Math.floor(datenLaenge / 2);
  const roh = new Int16Array(puffer, datenStart, anzahl);
  const daten = new Float32Array(Math.floor(anzahl / kanaele));
  for (let i = 0; i < daten.length; i++) {
    let summe = 0;
    for (let k = 0; k < kanaele; k++) summe += roh[i * kanaele + k];
    daten[i] = summe / kanaele / 32768;
  }
  return { rate, daten };
}

/** Einfache lineare Umskalierung der Abtastrate (16 kHz <-> 22 kHz) */
function skaliereRate(daten: Float32Array, von: number, nach: number): Float32Array {
  if (von === nach) return daten;
  const laenge = Math.max(1, Math.round((daten.length * nach) / von));
  const ergebnis = new Float32Array(laenge);
  for (let i = 0; i < laenge; i++) {
    const position = (i * von) / nach;
    const links = Math.floor(position);
    const rechts = Math.min(links + 1, daten.length - 1);
    const anteil = position - links;
    ergebnis[i] = daten[links] * (1 - anteil) + daten[rechts] * anteil;
  }
  return ergebnis;
}

function stille(sekunden: number, rate = ZIEL_RATE): Float32Array {
  return new Float32Array(Math.round(sekunden * rate));
}

/** Kurzes Intro-Glöckchen (zwei Töne, weich ausklingend) */
function introGlocke(rate = ZIEL_RATE): Float32Array {
  const laenge = Math.round(rate * 1.1);
  const daten = new Float32Array(laenge);
  const toene: { f: number; start: number; dauer: number }[] = [
    { f: 523.25, start: 0, dauer: 0.55 },
    { f: 783.99, start: 0.32, dauer: 0.7 }
  ];
  for (const ton of toene) {
    const von = Math.round(ton.start * rate);
    const bis = Math.min(laenge, von + Math.round(ton.dauer * rate));
    for (let i = von; i < bis; i++) {
      const t = (i - von) / rate;
      const huelle = Math.exp(-4.5 * t) * Math.min(1, t * 40);
      daten[i] += Math.sin(2 * Math.PI * ton.f * t) * huelle * 0.22;
    }
  }
  return daten;
}

function samplesZuWav(daten: Float32Array, rate = ZIEL_RATE): Blob {
  const puffer = new ArrayBuffer(44 + daten.length * 2);
  const sicht = new DataView(puffer);
  const schreibeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) sicht.setUint8(offset + i, text.charCodeAt(i));
  };

  schreibeText(0, 'RIFF');
  sicht.setUint32(4, 36 + daten.length * 2, true);
  schreibeText(8, 'WAVE');
  schreibeText(12, 'fmt ');
  sicht.setUint32(16, 16, true);
  sicht.setUint16(20, 1, true);
  sicht.setUint16(22, 1, true);
  sicht.setUint32(24, rate, true);
  sicht.setUint32(28, rate * 2, true);
  sicht.setUint16(32, 2, true);
  sicht.setUint16(34, 16, true);
  schreibeText(36, 'data');
  sicht.setUint32(40, daten.length * 2, true);

  let position = 44;
  for (let i = 0; i < daten.length; i++) {
    const wert = Math.max(-1, Math.min(1, daten[i]));
    sicht.setInt16(position, wert < 0 ? wert * 0x8000 : wert * 0x7fff, true);
    position += 2;
  }
  return new Blob([puffer], { type: 'audio/wav' });
}

/** Sind die neuronalen Stimmen einsatzbereit? */
export async function neuralExportMoeglich(): Promise<boolean> {
  try {
    if (ttsEngine.getEngine() !== 'piper') return false;
    const einstellungen = ttsEngine.getSettings();
    if (!einstellungen.piperHostAVoice) return false;
    return await stimmeGeladen(einstellungen.piperHostAVoice);
  } catch {
    return false;
  }
}

/** Text in sprechbare Häppchen teilen (lange Beiträge überfordern die Stimme) */
function haeppchen(text: string, maxZeichen = 320): string[] {
  const saetze = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const ergebnis: string[] = [];
  let aktuell = '';
  for (const satz of saetze) {
    if ((aktuell + ' ' + satz).trim().length > maxZeichen && aktuell) {
      ergebnis.push(aktuell.trim());
      aktuell = satz;
    } else {
      aktuell = `${aktuell} ${satz}`.trim();
    }
  }
  if (aktuell.trim()) ergebnis.push(aktuell.trim());
  return ergebnis.length > 0 ? ergebnis : [text.slice(0, maxZeichen)];
}

/**
 * Erzeugt eine echte gesprochene Podcast-Datei mit den Stimmen vom Gerät.
 * Der Text wird ausschließlich lokal verarbeitet.
 */
export async function generateNeuralPodcastWav(
  podcast: PodcastItem,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const einstellungen = ttsEngine.getSettings();
  const stimmeA = einstellungen.piperHostAVoice || '';
  const stimmeB = einstellungen.piperHostBVoice || stimmeA;
  if (!stimmeA) throw new Error('Keine neuronale Stimme gewählt.');
  const segmente = podcast.segments;
  if (segmente.length === 0) throw new Error('Dieser Podcast hat keine Beiträge.');

  onProgress?.(3);
  const teile: Float32Array[] = [introGlocke()];
  let letzterSprecher: string | null = null;

  for (let i = 0; i < segmente.length; i++) {
    const segment = segmente[i];
    const voiceId = segment.speaker === 'hostA' ? stimmeA : stimmeB;
    if (!voiceId) continue;

    if (letzterSprecher !== null) {
      teile.push(stille(letzterSprecher === segment.speaker ? PAUSE_ABSCHNITT : PAUSE_SPRECHERWECHSEL));
    }
    letzterSprecher = segment.speaker;

    const stuecke = haeppchen(segment.text);
    for (const stueck of stuecke) {
      const wav = await synthese(stueck, voiceId);
      const { rate, daten } = await wavZuSamples(wav);
      teile.push(skaliereRate(daten, rate, ZIEL_RATE));
    }
    onProgress?.(5 + Math.round(((i + 1) / segmente.length) * 90));
  }

  const gesamt = teile.reduce((summe, teil) => summe + teil.length, 0);
  const gemischt = new Float32Array(gesamt);
  let position = 0;
  for (const teil of teile) {
    gemischt.set(teil, position);
    position += teil.length;
  }

  onProgress?.(98);
  const blob = samplesZuWav(gemischt, ZIEL_RATE);
  onProgress?.(100);
  return blob;
}

/**
 * Export für die Oberfläche: nutzt die neuronale Stimme, wenn sie bereitliegt,
 * sonst die Tonkontur - und sagt der Oberfläche, was entstanden ist.
 */
export async function generatePodcastWav(
  podcast: PodcastItem,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; art: 'neural' | 'ton' }> {
  if (await neuralExportMoeglich()) {
    try {
      return { blob: await generateNeuralPodcastWav(podcast, onProgress), art: 'neural' };
    } catch (fehler) {
      console.warn('Neuronaler Export fehlgeschlagen, Tonkontur wird erzeugt:', fehler);
    }
  }
  return { blob: await generateSynthesizedPodcastWav(podcast, onProgress), art: 'ton' };
}

export function exportScriptAsMarkdown(podcast: PodcastItem): string {
  let md = `# DocuCast: ${podcast.title}\n\n`;
  md += `**Quelldokument:** ${podcast.documentName} (${(podcast.documentSize / 1024).toFixed(1)} KB)\n`;
  md += `**Format:** ${podcast.style.toUpperCase()}\n`;
  md += `**Geschätzte Dauer:** ~${Math.round(podcast.totalEstimatedSeconds / 60)} Minuten\n`;
  md += `**Erstellt am:** ${new Date(podcast.createdAt).toLocaleString('de-DE')}\n\n`;
  md += `---\n\n`;
  md += `## Dialog-Transkript\n\n`;

  podcast.segments.forEach((seg, index) => {
    const speakerLabel = seg.speaker === 'hostA' ? `🎙️ **${seg.speakerName}** (Host A)` : `💡 **${seg.speakerName}** (Host B)`;
    md += `${speakerLabel}:\n> "${seg.text}"\n\n`;
  });

  md += `\n---\n*Generiert mit DocuCast PWA — 100% clientseitig im Browser verarbeitet.*`;
  return md;
}

export function exportScriptAsJSON(podcast: PodcastItem): string {
  return JSON.stringify(podcast, null, 2);
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Erzeugt clientseitig eine abspielbare Audio-Podcast-Datei (WAV)
 * mit Audio-Introjingle, synthetisierten Tonfolgen für Sprecherwechsel
 * und Spektralmodulation für Offline-Speicherung.
 */
export async function generateSynthesizedPodcastWav(
  podcast: PodcastItem,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const sampleRate = 22050; // 22 kHz for compact mobile storage
  const totalSeconds = Math.min(300, Math.max(30, podcast.totalEstimatedSeconds)); // Cap for reasonable client memory
  const totalSamples = sampleRate * totalSeconds;
  
  onProgress?.(10);

  // Offline Audio Context für schnelle Hintergrund-Synthese
  const audioCtx = new OfflineAudioContext(1, totalSamples, sampleRate);

  // 1. Podcast Jingle (Intro Chime)
  playIntroChime(audioCtx, 0.2);

  // 2. Erzeuge akustische Sprecher-Signalmuster und Pausen
  let currentTime = 2.5;
  const segments = podcast.segments;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segDuration = Math.min(15, seg.estimatedDuration);
    const isHostA = seg.speaker === 'hostA';

    // Diskreter Sub-Chime bei Sprecherwechsel
    playSpeakerTransitionTone(audioCtx, currentTime, isHostA);

    // Menschliche Sprachformanten simulieren (akustische Sprachkontur)
    synthesizeSpeechContour(audioCtx, currentTime + 0.3, segDuration - 0.5, isHostA);

    currentTime += segDuration + 0.5;
    if (currentTime >= totalSeconds - 3) break;

    const progress = Math.round(15 + (i / segments.length) * 60);
    onProgress?.(progress);
  }

  // 3. Outro Jingle
  playIntroChime(audioCtx, Math.max(currentTime, totalSeconds - 3));

  onProgress?.(80);
  const renderedBuffer = await audioCtx.startRendering();

  onProgress?.(95);
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  onProgress?.(100);

  return wavBlob;
}

function playIntroChime(ctx: OfflineAudioContext, startTime: number) {
  const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

    gain.gain.setValueAtTime(0, startTime + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, startTime + idx * 0.12 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime + idx * 0.12);
    osc.stop(startTime + idx * 0.12 + 0.85);
  });
}

function playSpeakerTransitionTone(ctx: OfflineAudioContext, startTime: number, isHostA: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isHostA ? 320 : 480, startTime);
  osc.frequency.exponentialRampToValueAtTime(isHostA ? 420 : 380, startTime + 0.2);

  gain.gain.setValueAtTime(0.05, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + 0.25);
}

function synthesizeSpeechContour(
  ctx: OfflineAudioContext,
  startTime: number,
  duration: number,
  isHostA: boolean
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  const baseFreq = isHostA ? 130 : 210; // Deeper for Host A, higher for Host B
  osc.frequency.setValueAtTime(baseFreq, startTime);

  // Frequency cadence (simulating speech intonation)
  const steps = 6;
  for (let s = 1; s <= steps; s++) {
    const t = startTime + (duration * s) / steps;
    const pitchJitter = (Math.sin(s * 1.7) * 20);
    osc.frequency.linearRampToValueAtTime(baseFreq + pitchJitter, t);
  }

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isHostA ? 800 : 1200, startTime);
  filter.Q.setValueAtTime(2.5, startTime);

  gain.gain.setValueAtTime(0.01, startTime);
  gain.gain.linearRampToValueAtTime(0.07, startTime + 0.2);
  gain.gain.setValueAtTime(0.07, startTime + duration - 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const channelData = buffer.getChannelData(0);
  const dataLength = channelData.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}
