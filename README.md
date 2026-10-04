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
- **Vier Erzählstile:** Deep Dive (~5–8 Min), Kompakt/TL;DR (~2–3 Min), Experten-Interview (~4–6 Min), Diskussion & Story (~5–7 Min)
- **Zwei Sprecher:** eigene Namen für Host A und Host B, Sprache Deutsch oder Englisch
- **Vorlesen:** Web Speech API, automatische Stimmenwahl je Sprache, unterschiedliche Stimmen für beide Sprecher (wenn das Gerät zwei anbietet), Tempo 0,75×–2×, Sprünge von 15 Sekunden
- **Transkript:** laufender Beitrag wird hervorgehoben, Tippen springt zur Stelle
- **Bibliothek:** Podcasts lokal in IndexedDB, Favoriten, Löschen
- **Export:** WAV (22,05 kHz, mono) sowie Skript als Markdown oder JSON
- **Offline:** Service Worker legt die Programmdateien beim ersten Besuch ab, danach ohne Netz nutzbar
- **Installierbar:** PWA-Manifest, eigene Symbole, Dunkel/Hell-Umschaltung

## Grenzen (ehrlich)

- **Die Stimmen kommen vom Gerät.** Die Qualität hängt an der Sprachausgabe des Systems (Windows, Android, iOS, macOS, Linux klingen unterschiedlich); ohne installierte Stimme bleibt es still.
- **Die WAV-Datei enthält keine Sprache.** Der Browser kann die System-Sprachausgabe nicht mitschneiden. Der Export liefert die selbst berechnete Tonspur des Dialogs: Intro-Gong, je Sprecher eine Tonhöhen-Kontur (130 Hz Host A, 210 Hz Host B, bandpassgefiltert), Übergangstöne — exakt in der Länge des Skripts. Gemessen: rund 7,85 MB für ein Fünf-Minuten-Skript. Für echte Sprachaufnahmen braucht es ein Aufnahmegerät am Rechner, das den Systemklang abgreift.
- **Kein Server, also keine Synchronisation.** Wird der Browser-Speicher geleert oder das Gerät gewechselt, ist die Bibliothek weg — dafür ist der Export gedacht.
- **Sehr lange Dokumente** erzeugen sehr viele Beiträge; dafür gibt es den Stil „Kompakt".

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
python3 scripts/apply_csp_htaccess.py --dist dist --index index.html --csp "default-src 'self'; …"
HOST=… USER=… FTP_PASS=… python3 scripts/deploy_dist_ftps.py \
    --local dist --remote <account>/DocuCast --verify-base https://cstrsk.de/DocuCast/
```

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
