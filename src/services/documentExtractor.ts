/**
 * Clientseitige Dokumenten-Extraktion für PDF (.pdf) & Word (.docx)
 * Läuft vollständig im Browser ohne externe Server.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { ExtractedDocument, DocumentSection, ExtractionProgress } from '../types/podcast';

// Worker-Pfad für PDF.js initialisieren
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  } catch (err) {
    console.warn('PDF.js worker initialization warning:', err);
  }
}

export async function extractDocument(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedDocument> {
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  onProgress?.({
    status: 'reading',
    progressPercent: 5,
    message: `Lese Datei ${fileName} (${(file.size / 1024).toFixed(0)} KB)...`
  });

  const arrayBuffer = await file.arrayBuffer();

  let rawText = '';
  let pageCount: number | undefined;

  if (fileExt === 'pdf') {
    const result = await extractPdfText(arrayBuffer, onProgress);
    rawText = result.text;
    pageCount = result.pageCount;
  } else if (fileExt === 'docx') {
    const result = await extractDocxText(arrayBuffer, onProgress);
    rawText = result.text;
  } else if (fileExt === 'txt' || fileExt === 'md') {
    const decoder = new TextDecoder('utf-8');
    rawText = decoder.decode(arrayBuffer);
    onProgress?.({
      status: 'complete',
      progressPercent: 100,
      message: 'Textdatei erfolgreich geladen.'
    });
  } else {
    throw new Error(`Nicht unterstütztes Dateiformat (.${fileExt}). Bitte wähle eine PDF- oder DOCX-Datei.`);
  }

  // Text nachbereiten und strukturieren
  onProgress?.({
    status: 'analyzing',
    progressPercent: 90,
    message: 'Strukturiere Abschnitte und Kernaussagen...'
  });

  const cleanedText = cleanRawText(rawText);
  if (!cleanedText || cleanedText.length < 30) {
    throw new Error('Das Dokument enthält nicht genügend extrahierbaren Text oder ist passwortgeschützt/gescannt.');
  }

  const sections = parseSections(cleanedText);
  const words = cleanedText.trim().split(/\s+/).filter(Boolean);

  onProgress?.({
    status: 'complete',
    progressPercent: 100,
    message: `Extraktion abgeschlossen (${words.length} Wörter in ${sections.length} Abschnitten).`
  });

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: fileName,
    type: (fileExt === 'docx' ? 'docx' : fileExt === 'pdf' ? 'pdf' : 'text'),
    size: file.size,
    pageCount,
    wordCount: words.length,
    characterCount: cleanedText.length,
    extractedText: cleanedText,
    sections,
    createdAt: Date.now()
  };
}

async function extractPdfText(
  buffer: ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<{ text: string; pageCount: number }> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map((item: any) => (item.str ? item.str : ''))
        .filter((str: string) => str.trim().length > 0);

      const pageText = pageStrings.join(' ');
      if (pageText.trim()) {
        textPieces.push(`--- Seite ${pageNum} ---\n` + pageText);
      }

      // Progress reporting (10% to 85%)
      const percent = Math.min(85, Math.round(10 + (pageNum / totalPages) * 75));
      onProgress?.({
        status: 'extracting',
        progressPercent: percent,
        currentPage: pageNum,
        totalPages,
        message: `Extrahiere Seite ${pageNum} von ${totalPages}...`
      });

      // Yield event loop so UI does not freeze
      if (pageNum % 3 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    return {
      text: textPieces.join('\n\n'),
      pageCount: totalPages
    };
  } catch (err: any) {
    console.error('PDF Extraktion fehlgeschlagen:', err);
    throw new Error(`PDF konnte nicht gelesen werden: ${err.message || 'Format ungültig'}`);
  }
}

async function extractDocxText(
  buffer: ArrayBuffer,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<{ text: string }> {
  try {
    onProgress?.({
      status: 'extracting',
      progressPercent: 40,
      message: 'Lese Word-Dokument (DOCX) via Mammoth...'
    });

    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    
    onProgress?.({
      status: 'extracting',
      progressPercent: 80,
      message: 'DOCX-Text analysiert.'
    });

    return { text: result.value };
  } catch (err: any) {
    console.error('DOCX Extraktion fehlgeschlagen:', err);
    throw new Error(`Word-Dokument konnte nicht gelesen werden: ${err.message || 'Format ungültig'}`);
  }
}

function cleanRawText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    // Remove repeated spaces
    .replace(/[ ]{2,}/g, ' ')
    // Remove hyphenation at line breaks (e.g., "Kompu- \nter")
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Teilt Text in thematische Abschnitte für das Podcast-Skript ein
 */
export function parseSections(text: string): DocumentSection[] {
  const lines = text.split('\n');
  const sections: DocumentSection[] = [];

  let currentTitle = 'Einleitung & Hintergrund';
  let currentParagraphs: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section header candidates:
    // - Starts with # or ##
    // - Short line (less than 80 chars) ending without punctuation or in uppercase
    // - Starts with "Kapitel", "Chapter", "Abschnitt", "Teil", or "1.", "2."
    const isHeading =
      line.startsWith('#') ||
      line.startsWith('--- Seite') ||
      (/^(\d+\.?\s+[A-ZÄÖÜ]|Kapitel|Chapter|Abschnitt|Teil)/i.test(line) && line.length < 100) ||
      (line.length < 65 && line === line.toUpperCase() && /[A-ZÄÖÜ]/.test(line)) ||
      (line.length < 60 && !/[.,;:!?]$/.test(line) && currentParagraphs.length > 3);

    if (isHeading && currentParagraphs.length > 0) {
      const sectionContent = currentParagraphs.join('\n');
      sections.push({
        title: currentTitle.replace(/^#+\s*/, '').replace(/^---\s*|\s*---$/g, '').trim(),
        content: sectionContent,
        wordCount: sectionContent.split(/\s+/).filter(Boolean).length,
        keyPoints: extractKeyPoints(sectionContent)
      });

      currentTitle = line.replace(/^#+\s*/, '').trim();
      currentParagraphs = [];
    } else {
      currentParagraphs.push(line);
    }
  }

  // Push final section
  if (currentParagraphs.length > 0) {
    const sectionContent = currentParagraphs.join('\n');
    sections.push({
      title: currentTitle.replace(/^#+\s*/, '').replace(/^---\s*|\s*---$/g, '').trim(),
      content: sectionContent,
      wordCount: sectionContent.split(/\s+/).filter(Boolean).length,
      keyPoints: extractKeyPoints(sectionContent)
    });
  }

  // If only 1 huge section, split by paragraphs to make it digestible
  if (sections.length === 1 && sections[0].wordCount > 350) {
    return chunkLongSection(sections[0].content);
  }

  return sections;
}

function extractKeyPoints(content: string): string[] {
  const sentences = content
    .replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220);

  // Score sentences containing informative markers (numbers, keywords, conclusions)
  const scored = sentences.map((sentence) => {
    let score = 0;
    if (/\d+([.,]\d+)?%?/.test(sentence)) score += 3; // Contains numbers/percentages
    if (/(wichtig|wesentlich|entscheidend|Fazit|Ergebnis|bedeutet|zeigt|Ursache|Vorteil|Problem|Ziel)/i.test(sentence)) score += 3;
    if (sentence.length > 40 && sentence.length < 140) score += 2; // Optimal readability
    return { sentence, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((item) => item.sentence);
}

function chunkLongSection(text: string): DocumentSection[] {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
  const result: DocumentSection[] = [];
  const chunkSize = Math.max(2, Math.ceil(paragraphs.length / 4));

  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const group = paragraphs.slice(i, i + chunkSize);
    const content = group.join('\n\n');
    result.push({
      title: `Themenbereich ${Math.floor(i / chunkSize) + 1}`,
      content,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      keyPoints: extractKeyPoints(content)
    });
  }

  return result;
}
