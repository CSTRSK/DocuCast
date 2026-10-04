/**
 * Typdefinitionen für DocuCast PWA
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
}

export interface DocumentSection {
  title: string;
  content: string;
  wordCount: number;
  keyPoints: string[];
}

export type PodcastStyle = 'deep_dive' | 'tldr' | 'interview' | 'storytelling';

export interface PodcastConfig {
  title: string;
  style: PodcastStyle;
  language: 'de' | 'en';
  targetDurationMinutes: number; // e.g. 2, 5, 10
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
}

export interface ExtractionProgress {
  status: 'idle' | 'reading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progressPercent: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
  error?: string;
}
