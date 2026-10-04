/**
 * Web Worker für rechenintensive Textanalysen, Token-Zählung
 * und linguistische Satz-Segmentierung, um den Main-Thread (UI) 60fps flüssig zu halten.
 */

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'ANALYZE_TEXT') {
    const { text } = payload;
    const startTime = performance.now();

    // 1. Wort- und Zeichenzählung
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 2. Worthäufigkeit / Keywords ermitteln
    const stopWords = new Set([
      'und', 'oder', 'aber', 'denn', 'dass', 'die', 'der', 'das', 'den', 'dem', 'des',
      'ein', 'eine', 'einer', 'einem', 'einen', 'eines', 'in', 'im', 'zu', 'zur', 'zum',
      'von', 'vom', 'mit', 'auf', 'aus', 'für', 'an', 'am', 'um', 'bei', 'beim',
      'the', 'and', 'or', 'but', 'that', 'this', 'with', 'from', 'for', 'are', 'is', 'was'
    ]);

    const wordFreq: { [key: string]: number } = {};
    for (let i = 0; i < words.length; i++) {
      const raw = words[i].toLowerCase().replace(/[^a-zäöüß]/g, '');
      if (raw.length > 4 && !stopWords.has(raw)) {
        wordFreq[raw] = (wordFreq[raw] || 0) + 1;
      }
    }

    const sortedKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // 3. Satz-Segmentierung & Kennzahlen
    const sentences = text
      .replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, '$1|')
      .split('|')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 15);

    const averageSentenceLength = sentences.length > 0
      ? Math.round(words.length / sentences.length)
      : 0;

    const durationMs = performance.now() - startTime;

    self.postMessage({
      type: 'ANALYZE_COMPLETE',
      result: {
        wordCount,
        characterCount: text.length,
        sentenceCount: sentences.length,
        averageSentenceLength,
        keywords: sortedKeywords,
        analysisTimeMs: Math.round(durationMs)
      }
    });
  }
};
