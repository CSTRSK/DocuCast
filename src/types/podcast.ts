/**
 * Typdefinitionen für DocuCast PWA mit G20-Staaten & Sprachvariationen
 */

export type DocumentType = 'pdf' | 'docx' | 'text';

export interface ExtractedDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  extractedText: string;
  sections: DocumentSection[];
  createdAt: number;
  originalLanguage?: string;
}

export interface DocumentSection {
  title: string;
  content: string;
  wordCount: number;
  keyPoints: string[];
}

export type PodcastStyle = 
  | 'deep_dive'       // Ausführliche Diskussion
  | 'tldr'            // Kompakt
  | 'interview'       // Experten-Interview
  | 'storytelling'    // Locker & Erzählung
  | 'debate'          // Pro / Contra Debatte
  | 'tech_explainer'  // Technischer Deep Dive
  | 'news_flash';     // Breaking News Radio-Flash

export interface G20Country {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  langCode: string;
  langPrefix: string;
  langName: string;
  variationLabel: string;
  defaultHostA: string;
  defaultHostB: string;
  region: 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East & Africa';
}

export interface PodcastConfig {
  title: string;
  style: PodcastStyle;
  language: string;       // e.g. 'de', 'en', 'fr', 'es', 'ja', 'zh', 'it', 'pt', 'ru', 'ar', 'hi', 'tr', 'ko', 'id'
  countryId?: string;     // e.g. 'de-DE', 'en-US', 'ja-JP'
  targetDurationMinutes: number;
  hostAName: string;
  hostBName: string;
  hostARole: string;
  hostBRole: string;
  generationMode: 'rule_based' | 'webllm';
}

export interface TranscriptSegment {
  id: string;
  speaker: 'hostA' | 'hostB';
  speakerName: string;
  text: string;
  tone?: 'neutral' | 'curious' | 'insightful' | 'enthusiastic' | 'questioning';
  estimatedDuration: number; // seconds
}

export interface PodcastItem {
  id: string;
  title: string;
  documentName: string;
  documentSize: number;
  wordCount: number;
  style: PodcastStyle;
  language?: string;
  countryId?: string;
  flag?: string;
  segments: TranscriptSegment[];
  totalEstimatedSeconds: number;
  createdAt: number;
  isFavorite?: boolean;
  hasCachedAudio?: boolean;
}

export interface VoiceSettings {
  hostAVoiceURI: string;
  hostAPitch: number; // 0.5 - 1.5
  hostARate: number;  // 0.7 - 1.5
  hostBVoiceURI: string;
  hostBPitch: number; // 0.5 - 1.5
  hostBRate: number;  // 0.7 - 1.5
  playbackRate: number; // 0.75 - 2.0
  /** 'geraet' = Stimmen des Geräts (Web Speech), 'piper' = neuronale Stimmen auf dem Gerät */
  engine?: 'geraet' | 'piper';
  /** Piper-Stimmen der beiden Sprecher (IDs aus data/piperVoices.ts) */
  piperHostAVoice?: string;
  piperHostBVoice?: string;
}

export interface ExtractionProgress {
  status: 'idle' | 'reading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progressPercent: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
  error?: string;
}

export interface TranslationProgress {
  isTranslating: boolean;
  targetCountry?: G20Country;
  progressPercent: number;
  currentSegment?: number;
  totalSegments?: number;
}
