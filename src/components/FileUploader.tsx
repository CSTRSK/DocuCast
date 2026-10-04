import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, FileType, Sparkles, Layers, BookOpen } from 'lucide-react';
import { ExtractedDocument, ExtractionProgress } from '../types/podcast';
import { extractDocument } from '../services/documentExtractor';

interface FileUploaderProps {
  onDocumentExtracted: (doc: ExtractedDocument) => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDocumentExtracted,
  isProcessing
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setProgress({
        status: 'reading',
        progressPercent: 5,
        message: 'Lese Datei...'
      });

      const doc = await extractDocument(file, (p) => setProgress(p));
      onDocumentExtracted(doc);
    } catch (err: any) {
      setProgress({
        status: 'error',
        progressPercent: 0,
        message: 'Fehler bei der Extraktion',
        error: err.message || 'Die Datei konnte nicht verarbeitet werden.'
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Demo Documents for immediate one-click testing
  const loadDemoDoc = (sampleType: 'ai' | 'energy' | 'future') => {
    let demoTitle = '';
    let demoText = '';
    let docType: 'pdf' | 'docx' | 'text' = 'pdf';

    if (sampleType === 'ai') {
      demoTitle = 'Whitepaper_KI_in_der_Medizin.pdf';
      docType = 'pdf';
      demoText = `
# Whitepaper: Künstliche Intelligenz in der klinischen Diagnostik

## 1. Einleitung und Ausgangslage
Die Integration von Künstlicher Intelligenz in den klinischen Alltag markiert einen historischen Wendepunkt im Gesundheitswesen. Während traditionelle Diagnoseverfahren stark von der Verfügbarkeit von Fachärzten und subjektiver Bildinterpretation abhängen, ermöglichen moderne Deep-Learning-Algorithmen eine standardisierte, sekundenschnelle Auswertung von Bildgebungsdaten wie MRT, CT und Sonographie. Studien zeigen, dass multimodale Modelle bereits heute eine Sensitivität von über 94% bei der Früherkennung von Lungenkarzinomen erreichen.

## 2. Herausforderungen bei der Implementierung
Trotz der beachtlichen diagnostischen Präzision stehen Kliniken vor regulatorischen und ethischen Hürden. Der EU AI Act klassifiziert medizinische KI-Systeme als Hochrisikoanwendungen mit strengen Anforderungen an Transparenz, Auditierbarkeit und Datenschutz nach DSGVO. Zudem besteht das Problem der sogenannten „Black-Box-Entscheidungen“, weshalb Erklärbare KI (Explainable AI / XAI) zunehmend verpflichtend wird. Ärzte müssen jederzeit nachvollziehen können, auf welchen Bildmerkmalen ein Befundvorschlag basiert.

## 3. Wirtschaftlichkeit und Effizienzgewinne
Der Einsatz automatisierter Triage-Systeme in Notaufnahmen reduziert die Wartezeiten bis zur Erstbefundung um durchschnittlich 42%. Gleichzeitig sinkt die Fehlerquote bei Nachtschichten durch computergestützte Zweitmeinungen messbar. Die Amortisationszeit für moderne KI-Infrastrukturen in Maximalversorger-Kliniken liegt bei unter 18 Monaten, primär getrieben durch vermiedene Fehldiagnosen und optimierten Ressourceneinsatz.

## 4. Fazit und Ausblick
Künstliche Intelligenz wird Ärztinnen und Ärzte nicht ersetzen, aber Mediziner, die KI beherrschen, werden diejenigen ablösen, die sich ihr verwehren. Die Zukunft gehört der kooperativen Intelligenz: Menschliche Empathie und klinisches Urteilsvermögen kombiniert mit algorithmischer Präzision.
      `.trim();
    } else if (sampleType === 'energy') {
      demoTitle = 'Strategiepapier_Energiewende_2030.docx';
      docType = 'docx';
      demoText = `
# Strategiebericht: Dezentrale Energiesysteme und Netzstabilität 2030

## 1. Status Quo der Energiewende
Der Umbau der Energieversorgung von zentralen Großkraftwerken hin zu volatilen erneuerbaren Energien stellt das europäische Verbundnetz vor beispiellose Herausforderungen. Mit einem Anteil von über 55% grünem Strom an der Gesamtnetzeinspeisung gewinnt die Frage nach kurz- und langfristigen Speichertechnologien existenzielle Bedeutung für den Industriestandort.

## 2. Batteriespeicher und Netzbooster
Großflächige Lithium-Eisenphosphat- und Natrium-Ionen-Speicher etablieren sich als primäre Lösung für die Frequenzhaltung im Millisekundenbereich. Durch sogenannte virtuelle Kraftwerke, die tausende dezentrale Heimspeicher und Elektrofahrzeuge via Smart-Meter-Gateways bündeln, lassen sich Lastspitzen im Megawattbereich ohne fossile Gasturbinen abfangen.

## 3. Grüner Wasserstoff als saisonaler Speicher
Während Batteriespeicher für den Tag-Nacht-Ausgleich optimal geeignet sind, erfordert die saisonale Dunkelflaute im Winter molekulare Speicher. Elektrolyseure an Offshore-Windparks wandeln überschüssige Windenergie in grünen Wasserstoff um. Dieser wird in unterirdischen Salzkavernen gespeichert und bei Bedarf in H2-ready Gaskraftwerken rückverstromt.

## 4. Handlungsempfehlungen für die Politik
Entscheidend für den Erfolg bis 2030 sind beschleunigte Genehmigungsverfahren für SüdLink und OstWestLink sowie der Abbau von bürokratischen Hürden beim bidirektionalen Laden von E-Autos. Nur ein ganzheitlicher Ansatz garantiert Versorgungssicherheit und bezahlbare Strompreise.
      `.trim();
    } else {
      demoTitle = 'Kurzbericht_Zukunft_der_Arbeit.pdf';
      docType = 'pdf';
      demoText = `
# Management Briefing: Hybride Arbeitswelten und Wissensmanagement

## 1. Der Wandel der Unternehmenskultur
Nach dem flächendeckenden Übergang zu Remote- und Hybrid-Arbeitsmodellen zeigt sich: Präsenz im Büro ist kein Garant für Produktivität mehr. Führende Tech-Unternehmen setzen auf asynchrone Kommunikation und ergebnisorientierte Zielvereinbarungen anstelle von starrer Zeiterfassung.

## 2. Das Phänomen der Information Overload
Mitarbeitende verbringen heute durchschnittlich 2,4 Stunden täglich mit der Suche nach Dokumenten, E-Mails und Chat-Nachrichten in fragmentierten Systemen wie Slack, Teams und Notion. Dies führt zu kognitiver Erschöpfung und verringert die Zeit für konzentrierte Deep-Work-Phasen drastisch.

## 3. Audio und Microlearning als Lösung
Immer mehr Fachkräfte konsumieren Weiterbildungsinhalte und interne Briefings unterwegs als Audio-Zusammenfassungen. Das Hören von Inhalten während des Pendelns oder Spaziergangs aktiviert andere kognitive Verarbeitungswege und fördert das Behalten von Kernkonzepten.

## 4. Zusammenfassung
Wettbewerbsfähig bleiben jene Organisationen, die internes Wissen leicht zugänglich, multimodal und on-demand verfügbar machen.
      `.trim();
    }

    // Convert demo text to clean ExtractedDocument
    const lines = demoText.split('\n');
    const sections: any[] = [];
    let currentTitle = 'Einleitung';
    let currentBody: string[] = [];

    lines.forEach((l) => {
      if (l.startsWith('## ') || l.startsWith('# ')) {
        if (currentBody.length > 0) {
          sections.push({
            title: currentTitle,
            content: currentBody.join('\n'),
            wordCount: currentBody.join(' ').split(/\s+/).length,
            keyPoints: [currentBody[0] || '']
          });
          currentBody = [];
        }
        currentTitle = l.replace(/^#+\s*/, '').trim();
      } else if (l.trim()) {
        currentBody.push(l.trim());
      }
    });
    if (currentBody.length > 0) {
      sections.push({
        title: currentTitle,
        content: currentBody.join('\n'),
        wordCount: currentBody.join(' ').split(/\s+/).length,
        keyPoints: [currentBody[0] || '']
      });
    }

    const words = demoText.split(/\s+/).filter(Boolean);
    const demoDoc: ExtractedDocument = {
      id: `demo_${Date.now()}`,
      name: demoTitle,
      type: docType,
      size: Math.round(words.length * 7.5),
      pageCount: docType === 'pdf' ? 4 : undefined,
      wordCount: words.length,
      characterCount: demoText.length,
      extractedText: demoText,
      sections,
      createdAt: Date.now()
    };

    onDocumentExtracted(demoDoc);
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 shadow-sm ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-850'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-indigo-500/30 to-sky-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-xl group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Dokument hier ablegen oder antippen
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unterstützt <span className="text-indigo-600 dark:text-indigo-400 font-semibold">PDF (.pdf)</span> und{' '}
              <span className="text-sky-600 dark:text-sky-400 font-semibold">Word (.docx)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <FileType className="w-3 h-3 text-rose-500 dark:text-rose-400" /> PDF.js
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <FileText className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Mammoth DOCX
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> 100% Clientseitig
            </span>
          </div>
        </div>
      </div>

      {/* Progress State */}
      {progress && progress.status !== 'complete' && (
        <div
          className={`rounded-2xl border p-4.5 transition-all shadow-md ${
            progress.status === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200'
              : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2 text-xs font-semibold">
            <span className="flex items-center gap-2">
              {progress.status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping" />
              )}
              {progress.message}
            </span>
            {progress.status !== 'error' && (
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{progress.progressPercent}%</span>
            )}
          </div>

          {progress.status !== 'error' && (
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          )}

          {progress.error && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300 leading-relaxed">{progress.error}</p>
          )}
        </div>
      )}

      {/* Demo Samples for 1-Tap Experience */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Schnelltest mit Beispieldokumenten
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => loadDemoDoc('ai')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500/40 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">KI in der Medizin</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">PDF • 4 Seiten</div>
            </div>
          </button>

          <button
            onClick={() => loadDemoDoc('energy')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-sky-400 dark:hover:border-sky-500/40 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">Energiewende 2030</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">DOCX • Strategie</div>
            </div>
          </button>

          <button
            onClick={() => loadDemoDoc('future')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 dark:hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">Zukunft der Arbeit</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">PDF • Briefing</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
