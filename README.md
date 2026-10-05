# DocuCast — Dokumente zu Audio-Podcasts

**English:** A mobile-first, fully client-side PWA that turns PDF and Word documents into two-speaker
audio podcasts. Text extraction (pdf.js, mammoth) runs in a Web Worker on the device, a rule-based
generator writes the dialogue script, playback uses the browser's Web Speech API, and the WAV export
renders the dialogue's tone track locally. No upload, no account, no server. Live: https://cstrsk.de/DocuCast/

---

## Was das ist

DocuCast nimmt ein Dokument — PDF, Word (.docx) oder reinen Text — und macht daraus ein Gespräch
zwischen zwei Sprechenden: Einstieg, Hauptteil entlang der Abschnitte, Schluss. Man kann zuhören,
im Transkript springen, das Skript nachbessern und die Tonspur als WAV exportieren.

Alles passiert im Browser. Es gibt **keinen Netzwerkaufruf für ein Dokument**: Die Textextraktion
läuft lokal (pdf.js für PDF, mammoth für DOCX), in einem Web Worker, damit die Oberfläche bedienbar
bleibt.

## Funktionen

- **Formate:** PDF (.pdf), Word (.docx), Text (.txt, .md) — inklusive drei beiliegender Beispieldokumente zum Sofort-Testen
- **Sieben Erzählstile:** Deep Dive (~5–8 Min), Kompakt/TL;DR (~2–3 Min), Experten-Interview (~4–6 Min), Diskussion & Story (~5–7 Min), Kontroverse & Debatte (~4–6 Min), Tech-Deep-Dive (~5–8 Min), 2-Minuten News-Flash (~2 Min)
- **Zwei Sprecher:** eigene Namen für Host A und Host B
- **G20-Lokalisierung:** über 30 Sprachvarianten — Deutsch (Standard, Nord, Bayern, Österreich, Schweiz), Englisch (General American, UK, Australien, Schottland), Spanisch (u. a. Rioplatense-AR), Französisch (u. a. CA), dazu u. a. Japanisch, Koreanisch, Chinesisch, Hindi, Arabisch, Russisch, Türkisch, Indonesisch, Polnisch, Niederländisch. Mit der Landesauswahl wechseln Gesprächsführung und Moderatorennamen
- **Vorlesen mit drei Klangquellen:**
  1. **Gerätestimmen** (Web Speech API) – sofort einsatzbereit, kein Download, Klang je nach Gerät
  2. **Neuronale Stimmen (Piper):** im Reiter „Stimmen" **aufs Gerät laden** – einmalig 60–110 MB, danach offline und deutlich natürlicher. Aus über 60 Sprachen mit zusammen 121 Stimmen (davon 75 mit dem aktuellen Phonemsatz). Deutsche Empfehlung: `thorsten-medium`, `thorsten_emotional-medium` (8 Sprecher), `mls-medium` (236 Sprecher)
  3. **Eigene Stimme mitbringen:** eigene `.onnx` + `.onnx.json` hochladen – die App prüft sie sofort und nutzt sie wie eine eingebaute Stimme. **Direkte Download-Links** zu passenden Dateien stehen in der App (Hugging-Face-Spiegel der Piper-Stimmen), inklusive Übersicht über alle Stimmen
- **Unterschiedliche Stimmen für beide Sprecher**, automatische Stimmenwahl je Sprache, Tempo 0,75×–2×, Sprünge von 15 Sekunden
- **Transkript:** laufender Beitrag wird hervorgehoben, Tippen springt zur Stelle
- **Bibliothek:** Podcasts lokal in IndexedDB, Favoriten, Löschen
- **Export:** WAV (22,05 kHz, mono) sowie Skript als Markdown oder JSON
- **Offline:** Service Worker legt die Programmdateien beim ersten Besuch ab, danach ohne Netz nutzbar
- **Installierbar:** PWA-Manifest, eigene Symbole, Dunkel/Hell-Umschaltung

## Grenzen (ehrlich)

- **Die Stimmen kommen vom Gerät.** Die Qualität hängt an der Sprachausgabe des Systems (Windows, Android, iOS, macOS, Linux klingen unterschiedlich); ohne installierte Stimme bleibt es still.
- **Der Audio-Export hängt an der Klangquelle.** Mit neuronalen Stimmen entsteht eine **echte Sprachaufnahme**: die Sätze werden einzeln synthetisiert, mit Pausen und Intro-Gong zu einer WAV-Datei gesetzt (gemessen: 272 KB / 6,18 s für eine dreiteilige Prüffolge; 130 KB / 2,95 s für einen Satz). Mit **Gerätestimmen** bleibt es bei der selbst berechneten Tonspur (Intro-Gong plus Tonhöhen-Kontur, 130 Hz Host A / 210 Hz Host B) — der Browser kann die System-Sprachausgabe per Standard nicht mitschneiden. Die Oberfläche sagt nach dem Export, was entstanden ist.
- **Stimmen der ersten Piper-Generation** (genau 130 Phoneme, u. a. alle `x_low`-Stimmen) passen nicht zur heutigen Aussprache-Laufzeit. Sie sind in der App standardmäßig ausgeblendet; wer sie einblendet, sieht nach dem Laden sofort „auf diesem Gerät nicht nutzbar". Von 121 Stimmen sind 75 nutzbar.
- **Kein Server, also keine Synchronisation.** Wird der Browser-Speicher geleert oder das Gerät gewechselt, ist die Bibliothek weg — dafür ist der Export gedacht.
- **Sehr lange Dokumente** erzeugen sehr viele Beiträge; dafür gibt es den Stil „Kompakt".
- **Lokalisierung ohne Server übersetzt nur die Gesprächsführung.** Die App kann den Dialog in über 30 Sprachvarianten erzeugen — Begrüßung, Übergänge, Rückfragen, Verabschiedung und Moderatorennamen kommen in der Zielsprache, die **Inhaltssätze bleiben in der Sprache des Dokuments**. Ein durchgehend übersetzter Podcast bräuchte einen Übersetzungsdienst auf einem Server (mit Schlüssel) und würde den Dokumenttext aus dem Gerät schicken — genau das vermeidet diese App. Ein Hinweis darauf steht im Übersetzungsdialog.

## Stimmen (neuronale Sprachausgabe)

Die Sprachausgabe läuft **vollständig auf dem Gerät**: Der Dokumenttext wird lokal phonemisiert und
synthetisiert (Piper-Modelle über ONNX Runtime WebAssembly im Browser). Es gibt keinen Serveraufruf
mit Text, keinen Schlüssel und kein Konto.

**Woher die Modelle kommen**

1. **Eigener Spiegel zuerst:** `https://cstrsk.de/DocuCast/voices/` mit einem Verzeichnis
   (`verzeichnis.json`), das die vorhandenen Stimmen samt Prüfsumme auflistet. Standardmäßig liegen
   dort die zwei deutschen Startstimmen (`thorsten-medium`, `thorsten_emotional-medium`).
   Der Hoster liefert keine Dateien über ~20 MB aus, deshalb liegen die großen Modelle **in 16-MB-Teilen**
   (`.part1 … .partN`); die App setzt sie zusammen und prüft sie per **SHA-256**.
2. **Hugging Face als Rückfall** (`diffusionstudio/piper-voices`) für alle weiteren der 121 Stimmen.

**Laufzeitdateien** (ONNX Runtime + Piper-Phonemizer, ~39 MB) liegen unter
`/DocuCast/voices-runtime/` — same-origin, dauerhaft zwischengespeichert, kein Fremd-CDN.

**Eigene Stimme:** Beide Dateien nötig (`.onnx` Modell und `.onnx.json` Konfiguration). Nach dem
Import läuft automatisch ein Test (`selbstTest`); das Ergebnis steht als „geprüft" bzw. „auf diesem
Gerät nicht nutzbar" in der Liste. Die Downloads stammen von den Modell-Karten der Piper-Stimmen;
Modelle: MIT, deutsche `thorsten`-Stimmen: CC0.

**Lizenz:** DocuCast steht unter AGPL-3.0, die Stimmen-Modelle von Piper unter MIT. Die Stimmen
sind **nicht** Teil des Repositories — sie werden zur Laufzeit auf das Gerät geladen.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver auf Port 3000
npm run lint       # TypeScript-Prüfung
npm run build      # Produktionsbuild nach dist/
```

Der Build erzeugt zusätzlich den Service Worker (`sw.js`), das Manifest und den vorbereitenden
Cache. Alle Pfade sind relativ (`base: './'`), damit die App in einem Unterordner läuft; `scope`
und `start_url` im Manifest sind ebenfalls relativ, damit der Service Worker **nur** den eigenen
Ordner kontrolliert und nicht die ganze Domain.

### Deployment in einen Unterordner

```bash
npm run build
# CSP/Header NACH dem Build setzen -- sonst steht die alte Policy im ausgelieferten index.html
python3 scripts/apply_csp_htaccess.py --dist dist --index dist/index.html
HOST=… USER=… FTP_PASS=… python3 scripts/deploy_dist_ftps.py \
    --local dist --remote cstrsk.de/DocuCast --verify-base https://cstrsk.de/DocuCast/
```

Für die neuronale Sprachausgabe ist die CSP erweitert: `script-src … 'wasm-unsafe-eval'`,
`worker-src 'self' blob:` sowie (nur als Rückfall) `connect-src` zu Hugging Face und den
CDNs. Die Laufzeit- und Modell-Dateien selbst kommen **same-origin** von cstrsk.de.

**Web-Wurzel und große Dateien:** Beim FTPS-Zugang ist der **Web-Wurzelordner `cstrsk.de/`**
(oft `/html/` erreichbar), nicht das FTP-Hauptverzeichnis. Der Hoster liefert per HTTP keine Dateien
über ~20 MB aus — große Stimmen deshalb in Teile zerlegen (`*.part1 …`, dazu `.parts.json` oder
Eintrag in `verzeichnis.json`).

`scripts/deploy_dist_ftps.py` liest die Zugangsdaten **nur** aus der Umgebung, es stehen keine
Zugangsdaten im Repository. Das Skript legt fehlende Ordner an (absolute Pfade — relative `MKD`
erzeugt sonst verschachtelte Müllordner), räumt veraltete Asset-Dateien auf und prüft nach dem
Upload jede in `index.html` referenzierte Datei über HTTP.

## Datenschutz

Kein Konto, kein Upload, kein Tracking in der App. Dokumenttexte, Skripte und Audiodateien bleiben
im lokalen Speicher des Browsers. Auf der Live-Instanz zählt ein Seitenaufruf mit dem
selbstgehosteten Zähler der Website — das ist die einzige Netzwerkverbindung, die nicht zur App gehört.

## Technik

| Baustein | Einsatz |
|---|---|
| React 19 + TypeScript | Oberfläche, Zustand |
| Vite 8 + Tailwind 4 | Build und Styling |
| vite-plugin-pwa (Workbox) | Service Worker, Manifest, Precache |
| pdf.js | PDF-Textextraktion |
| mammoth | DOCX-Textextraktion |
| Web Speech API | Vorlesen |
| OfflineAudioContext | WAV-Erzeugung |
| IndexedDB | lokale Bibliothek |

## Lizenz

AGPL-3.0 — siehe [LICENSE](LICENSE).

---

CSTRSK.DE · COPYRIGHT 2008–2026 · Live: https://cstrsk.de/DocuCast/
