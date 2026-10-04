/**
 * Export- und Audio-Synthese-Dienst:
 * Erstellt Skript-Exporte (Markdown/JSON) und generiert clientseitig
 * portable Audio-Dateien (WAV) via Web Audio API.
 */

import { PodcastItem } from '../types/podcast';

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
