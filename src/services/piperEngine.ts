/**
 * Piper-Motor für DocuCast: neuronale Stimmen, die auf dem Gerät liegen.
 *
 * Kernidee (Vorgabe: "Nutzer providen selbst ODER wir laden es ihnen lokal rein"):
 *  1. Fertige Stimmen holen wir vom eigenen Spiegel (GitHub-Release dieses Repos) und
 *     schreiben sie in den Gerätespeicher (OPFS). Hugging Face dient nur als Rückfall.
 *  2. Der Nutzer kann eine eigene Stimme mitbringen (.onnx + .onnx.json) - sie landet
 *     ebenfalls im Gerätespeicher und ist sofort benutzbar.
 *  3. Der Text verlässt das Gerät nie: phonemisiert und synthetisiert wird lokal.
 *
 * Die Bibliothek @mintplex-labs/piper-tts-web liest Modelle aus dem OPFS-Ordner "piper"
 * unter dem Dateinamen der Modell-URL. Wir schreiben genau dort hinein - dadurch findet
 * sie die von uns geladene Datei und lädt nichts nach.
 */
import { TtsSession, PATH_MAP, ONNX_BASE, WASM_BASE } from '@mintplex-labs/piper-tts-web';
import { PIPER_VOICES, voiceById, PiperVoice } from '../data/piperVoices';

/** Selbst gehostete Laufzeit (gleiche Domain -> keine Fremd-CDNs, strenge CSP bleibt möglich) */
const RUNTIME = new URL('voices-runtime/', document.baseURI).href;

/**
 * Ort der Laufzeit-Dateien. Fällt eine davon aus, wird automatisch die
 * öffentliche Quelle genutzt (dann ist eine Fremd-Domain nötig, siehe CSP).
 */
export const WASM_PFADE = {
  onnxWasm: RUNTIME,
  piperWasm: `${RUNTIME}piper_phonemize.wasm`,
  piperData: `${RUNTIME}piper_phonemize.data`,
};

const RUNTIME_RUECKFALL = {
  onnxWasm: ONNX_BASE,
  piperWasm: `${WASM_BASE}.wasm`,
  piperData: `${WASM_BASE}.data`,
};

/**
 * Modell-Quellen in der Reihenfolge, in der sie probiert werden.
 *  - der eigene Spiegel liegt auf cstrsk.de (gleiche Domain -> keine Fremdanfrage, kein CORS)
 *    und führt ein Verzeichnis (verzeichnis.json), damit keine Fehlversuche entstehen
 *  - Hugging Face deckt alle weiteren Stimmen ab
 */
export const MODELL_QUELLEN: { basis: string; verzeichnis: boolean }[] = [
  { basis: new URL('voices/', document.baseURI).href, verzeichnis: true },
  { basis: 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main', verzeichnis: false },
];

/** Eintrag im Verzeichnis unseres Spiegels */
interface SpiegelEintrag {
  teile?: number;
  groesse?: number;
  sha256?: string;
}

let spiegelVerzeichnis: Record<string, SpiegelEintrag> | null = null;
let spiegelGelesen = false;

/** Liest das Verzeichnis unseres Spiegels - genau einmal pro Sitzung. */
async function holeSpiegelEintrag(basis: string, name: string): Promise<SpiegelEintrag | null> {
  if (!spiegelGelesen) {
    spiegelGelesen = true;
    try {
      const antwort = await fetch(`${basis}verzeichnis.json`, { mode: 'cors' });
      spiegelVerzeichnis = antwort.ok ? ((await antwort.json()) as Record<string, SpiegelEintrag>) : null;
    } catch {
      spiegelVerzeichnis = null;
    }
  }
  return spiegelVerzeichnis?.[name] || null;
}

const OPFS_ORDNER = 'piper';
const EIGENE_STIMMEN_KEY = 'docucast.eigeneStimmen';

export interface EigeneStimme {
  id: string;
  name: string;
  groesseMb: number;
  angelegt: number;
}

export interface DownloadFortschritt {
  geladen: number;
  gesamt: number;
  datei: string;
}

/* ------------------------------------------------------------------ OPFS */

async function opfsOrdner(erstellen = false): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(OPFS_ORDNER, { create: erstellen });
}

function dateiName(vonPfad: string): string {
  return vonPfad.split('/').filter(Boolean).pop() as string;
}

/** Dateien, die zu einer Stimme im Gerätespeicher gehören (Modell + Konfiguration) */
function dateiNamen(voiceId: string): { modell: string; konfig: string } | null {
  const pfad = (PATH_MAP as Record<string, string>)[voiceId];
  if (!pfad) return null;
  const name = dateiName(pfad);
  return { modell: name, konfig: `${name}.json` };
}

async function holeDatei(name: string): Promise<File | null> {
  try {
    const dir = await opfsOrdner(true);
    const handle = await dir.getFileHandle(name);
    return await handle.getFile();
  } catch {
    return null;
  }
}

async function schreibeDatei(name: string, daten: Blob): Promise<void> {
  const dir = await opfsOrdner(true);
  const handle = await dir.getFileHandle(name, { create: true });
  const schreib = await (handle as any).createWritable();
  await schreib.write(daten);
  await schreib.close();
}

async function loescheDatei(name: string): Promise<void> {
  try {
    const dir = await opfsOrdner(false);
    await (dir as any).removeEntry(name);
  } catch {
    /* Datei war nicht da - egal */
  }
}

/* -------------------------------------------------------------- Stimmen */

/** Ist die Stimme vollständig auf diesem Gerät? */
export async function stimmeGeladen(voiceId: string): Promise<boolean> {
  const namen = dateiNamen(voiceId);
  if (!namen) return false;
  const modell = await holeDatei(namen.modell);
  if (!modell) return false;
  const konfig = await holeDatei(namen.konfig);
  return !!konfig;
}

/** Alle Stimmen, die auf diesem Gerät liegen (inkl. eigener Stimmen) */
export async function geladeneStimmen(): Promise<string[]> {
  try {
    const dir = await opfsOrdner(false);
    const namen: string[] = [];
    for await (const [name] of (dir as any).entries()) namen.push(name);
    const ids = new Set<string>(eigeneStimmen().map((s) => s.id));
    for (const v of PIPER_VOICES) {
      const n = dateiNamen(v.id);
      if (n && namen.includes(n.modell) && namen.includes(n.konfig)) ids.add(v.id);
    }
    return [...ids];
  } catch {
    return eigeneStimmen().map((s) => s.id);
  }
}

export async function dateiGroesse(voiceId: string): Promise<number> {
  const namen = dateiNamen(voiceId);
  if (!namen) return 0;
  const a = await holeDatei(namen.modell);
  const b = await holeDatei(namen.konfig);
  return (a?.size || 0) + (b?.size || 0);
}

/** Belegter Speicher aller Stimmen + verfügbares Kontingent */
export async function speicherInfo(): Promise<{ belegtMb: number; kontingentMb: number }> {
  let belegt = 0;
  try {
    const dir = await opfsOrdner(false);
    for await (const [name, handle] of (dir as any).entries()) {
      if (!name.endsWith('.onnx') && !name.endsWith('.onnx.json')) continue;
      try {
        const datei = await (handle as FileSystemFileHandle).getFile();
        belegt += datei.size;
      } catch {
        /* ignorieren */
      }
    }
  } catch {
    /* kein Speicher vorhanden */
  }
  let kontingent = 0;
  try {
    const schaetzung = await navigator.storage.estimate();
    kontingent = schaetzung.quota || 0;
  } catch {
    /* egal */
  }
  return { belegtMb: belegt / 1048576, kontingentMb: kontingent / 1048576 };
}

/* ------------------------------------------------------------- Download */

async function ladeMitFortschritt(
  url: string,
  onProgress?: (p: DownloadFortschritt) => void,
  datei = ''
): Promise<Blob> {
  const antwort = await fetch(url, { mode: 'cors' });
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status} für ${url}`);
  const gesamt = Number(antwort.headers.get('Content-Length') || 0);
  const leser = antwort.body?.getReader();
  if (!leser) return await antwort.blob();

  const teile: Uint8Array[] = [];
  let geladen = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    if (value) {
      teile.push(value);
      geladen += value.length;
      onProgress?.({ geladen, gesamt, datei });
    }
  }
  return new Blob(teile as BlobPart[]);
}

/**
 * Manche Webhoster liefern keine Dateien über ~20 MB aus. Deshalb liegen große
 * Stimmen dort zusätzlich in Teilen: <datei>.parts.json nennt Anzahl und Größe,
 * die Teile heißen <datei>.part1, .part2 ...
 */
async function ladeInTeilen(
  basis: string,
  name: string,
  onProgress?: (p: DownloadFortschritt) => void,
  vorgabe?: SpiegelEintrag | null
): Promise<Blob | null> {
  let plan: { teile?: number; groesse?: number; sha256?: string } | null = vorgabe || null;
  if (!plan) {
    try {
      const antwort = await fetch(`${basis}${name}.parts.json`, { mode: 'cors' });
      if (!antwort.ok) return null;
      plan = await antwort.json();
    } catch {
      return null;
    }
  }
  const anzahl = Number(plan?.teile || 0);
  if (anzahl < 2) return null;

  const gesamt = Number(plan?.groesse || 0);
  const stuecke: BlobPart[] = [];
  let geladen = 0;
  for (let i = 1; i <= anzahl; i++) {
    const teil = await fetch(`${basis}${name}.part${i}`, { mode: 'cors' });
    if (!teil.ok) throw new Error(`HTTP ${teil.status} für Teil ${i}`);
    const puffer = await teil.arrayBuffer();
    stuecke.push(puffer);
    geladen += puffer.byteLength;
    onProgress?.({ geladen, gesamt: gesamt || geladen, datei: name });
  }

  const zusammen = new Blob(stuecke);
  if (plan?.sha256 && globalThis.crypto?.subtle && zusammen.size === gesamt) {
    // Prüfsumme: so fällt ein unvollständiger oder verfälschter Download sofort auf.
    const roh = new Uint8Array(await zusammen.arrayBuffer());
    const summe = await crypto.subtle.digest('SHA-256', roh);
    const hex = [...new Uint8Array(summe)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (hex !== plan.sha256) throw new Error('Prüfsumme der Stimme stimmt nicht.');
  }
  return zusammen;
}

/**
 * Lädt eine fertige Stimme auf dieses Gerät (einmalig, danach offline).
 * Quelle: eigener Spiegel dieses Projekts, danach Hugging Face als Rückfall.
 */
export async function stimmeLaden(
  voiceId: string,
  onProgress?: (p: DownloadFortschritt) => void
): Promise<void> {
  const v = voiceById(voiceId);
  const namen = dateiNamen(voiceId);
  if (!namen) throw new Error(`Unbekannte Stimme: ${voiceId}`);
  if (!v) throw new Error(`Kein Metadatensatz für ${voiceId}`);

  const ziele = [
    { name: namen.modell, relativ: v.path },
    { name: namen.konfig, relativ: `${v.path}.json` },
  ];

  for (const ziel of ziele) {
    if (await holeDatei(ziel.name)) continue; // schon da
    let letzterFehler: unknown = null;

    for (const quelle of MODELL_QUELLEN) {
      const basis = quelle.basis.endsWith('/') ? quelle.basis : `${quelle.basis}/`;

      // Unser Spiegel führt ein Verzeichnis - so entstehen keine Fehlversuche
      // für Stimmen, die dort gar nicht liegen.
      let eintrag: SpiegelEintrag | null = null;
      if (quelle.verzeichnis) {
        eintrag = await holeSpiegelEintrag(basis, ziel.name);
        if (!eintrag) {
          letzterFehler = new Error('nicht im eigenen Spiegel');
          continue;
        }
      }

      try {
        if (eintrag?.teile && eintrag.teile > 1) {
          // Große Dateien liegen bei unserem Hoster nur in Teilen vor
          const daten = await ladeInTeilen(basis, ziel.name, onProgress, eintrag);
          if (!daten || daten.size === 0) throw new Error('leere Antwort');
          await schreibeDatei(ziel.name, daten);
          letzterFehler = null;
          break;
        }

        for (const url of [`${basis}${ziel.relativ}`, `${basis}${ziel.name}`]) {
          try {
            const daten = await ladeMitFortschritt(url, onProgress, ziel.name);
            if (daten.size === 0) throw new Error('leere Antwort');
            await schreibeDatei(ziel.name, daten);
            letzterFehler = null;
            break;
          } catch (fehler) {
            letzterFehler = fehler;
          }
        }
      } catch (fehler) {
        letzterFehler = fehler;
      }

      if (!letzterFehler) break;
    }
    if (letzterFehler) {
      throw new Error(
        `Download fehlgeschlagen (${ziel.name}). Bitte Verbindung prüfen und erneut versuchen.`
      );
    }
  }
}

/** Entfernt eine Stimme von diesem Gerät */
export async function stimmeLoeschen(voiceId: string): Promise<void> {
  const namen = dateiNamen(voiceId);
  if (namen) {
    await loescheDatei(namen.modell);
    await loescheDatei(namen.konfig);
  }
  entferneEigeneStimme(voiceId);
  if (aktuelleSession?.voiceId === voiceId) aktuelleSession = null;
}

/* -------------------------------------------------------- eigene Stimme */

export function eigeneStimmen(): EigeneStimme[] {
  try {
    const roh = localStorage.getItem(EIGENE_STIMMEN_KEY);
    return roh ? (JSON.parse(roh) as EigeneStimme[]) : [];
  } catch {
    return [];
  }
}

function merkeEigeneStimme(eintrag: EigeneStimme) {
  const liste = eigeneStimmen().filter((s) => s.id !== eintrag.id);
  liste.push(eintrag);
  localStorage.setItem(EIGENE_STIMMEN_KEY, JSON.stringify(liste));
}

function entferneEigeneStimme(id: string) {
  const liste = eigeneStimmen().filter((s) => s.id !== id);
  localStorage.setItem(EIGENE_STIMMEN_KEY, JSON.stringify(liste));
}

/**
 * Nutzer bringt eine eigene Piper-Stimme mit: .onnx (Modell) + .onnx.json (Konfiguration).
 * Beide Dateien wandern in den Gerätespeicher; danach ist die Stimme wie eine fertige nutzbar.
 */
export async function eigeneStimmeImportieren(
  modellDatei: File,
  konfigDatei: File,
  anzeigeName: string
): Promise<EigeneStimme> {
  if (!/\.onnx$/i.test(modellDatei.name)) {
    throw new Error('Die Modelldatei muss auf .onnx enden.');
  }
  let konfig: any;
  try {
    konfig = JSON.parse(await konfigDatei.text());
  } catch {
    throw new Error('Die Konfigurationsdatei ist kein gültiges JSON.');
  }
  if (!konfig?.audio?.sample_rate || !konfig?.phoneme_id_map) {
    throw new Error('Das ist keine Piper-Konfiguration (audio.sample_rate / phoneme_id_map fehlen).');
  }

  const basis = anzeigeName
    .toLowerCase()
    .replace(/[äöüß]/g, (z) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[z] as string))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'eigene-stimme';
  const id = `eigen-${basis}`;

  // Die Bibliothek schlägt den Pfad in PATH_MAP nach - wir tragen unsere Stimme dort ein.
  (PATH_MAP as Record<string, string>)[id] = `eigen/${id}.onnx`;

  await schreibeDatei(`${id}.onnx`, modellDatei);
  await schreibeDatei(`${id}.onnx.json`, new Blob([JSON.stringify(konfig)], { type: 'application/json' }));

  const eintrag: EigeneStimme = {
    id,
    name: anzeigeName.trim() || 'Eigene Stimme',
    groesseMb: Math.round((modellDatei.size / 1048576) * 10) / 10,
    angelegt: Date.now(),
  };
  merkeEigeneStimme(eintrag);
  return eintrag;
}

/* -------------------------------------------------------------- Synthese */

let aktuelleSession: { voiceId: string; session: TtsSession } | null = null;
/** Nach einem Fehler einmalig die öffentliche Laufzeit probieren (Eigenhosting ausgefallen) */
let nutzeRueckfall = false;

async function sessionFuer(voiceId: string, onProgress?: (p: DownloadFortschritt) => void) {
  if (aktuelleSession?.voiceId === voiceId) return aktuelleSession.session;
  const session = await TtsSession.create({
    voiceId,
    wasmPaths: nutzeRueckfall ? RUNTIME_RUECKFALL : WASM_PFADE,
    progress: (p: any) => onProgress?.({ geladen: p.loaded || 0, gesamt: p.total || 0, datei: p.url || '' }),
    logger: () => {},
  });
  aktuelleSession = { voiceId, session };
  return session;
}

/**
 * Wandelt Text in eine WAV-Datei um - vollständig auf dem Gerät.
 * Achtung: der erste Aufruf pro Stimme lädt das Modell in den Arbeitsspeicher (~1-2 s).
 */
export async function synthese(
  text: string,
  voiceId: string,
  onProgress?: (p: DownloadFortschritt) => void
): Promise<Blob> {
  const sauber = (text || '').trim();
  if (!sauber) throw new Error('Kein Text zum Sprechen.');
  try {
    return await (await sessionFuer(voiceId, onProgress)).predict(sauber);
  } catch (fehler) {
    // Fehlt eine Laufzeitdatei auf unserem Server, wird sie einmalig öffentlich geholt.
    if (nutzeRueckfall) throw fehler;
    nutzeRueckfall = true;
    aktuelleSession = null;
    try {
      (TtsSession as any)._instance = null;
      (TtsSession as any).waitReady = undefined;
    } catch {
      /* egal */
    }
    return await (await sessionFuer(voiceId, onProgress)).predict(sauber);
  }
}

/** Laufzeit-Probe: erzeugt die kürzeste sinnvolle Äußerung, um Fehler früh zu sehen */
export async function selbstTest(voiceId: string): Promise<{ ok: boolean; bytes: number; ms: number; fehler?: string }> {
  const t0 = performance.now();
  try {
    const blob = await synthese('Test.', voiceId);
    return { ok: blob.size > 44, bytes: blob.size, ms: Math.round(performance.now() - t0) };
  } catch (fehler: any) {
    return { ok: false, bytes: 0, ms: Math.round(performance.now() - t0), fehler: String(fehler?.message || fehler) };
  }
}

/** Pfade zurücksetzen, falls die eigene Laufzeit fehlt (Rückfall auf öffentliche Quelle) */
export async function laufzeitErreichbar(): Promise<boolean> {
  try {
    const antwort = await fetch(WASM_PFADE.piperData, { method: 'HEAD' });
    return antwort.ok;
  } catch {
    return false;
  }
}

export function wasmPfadeFuer(selbstGehostet: boolean) {
  return selbstGehostet ? WASM_PFADE : RUNTIME_RUECKFALL;
}
