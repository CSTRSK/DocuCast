/**
 * Lokaler Podcast-Skript-Generator für zwei Sprecher (Host A & Host B).
 * Unterstützt modulare Generierung: Hochentwickelte regelbasierte NLP-Synthese
 * (100% offline & blitzschnell) mit konfigurierbaren Stilen und Tonlagen.
 */

import { ExtractedDocument, PodcastConfig, TranscriptSegment, DocumentSection } from '../types/podcast';

type RawTurn = Omit<TranscriptSegment, 'id' | 'estimatedDuration'>;

export async function generatePodcastScript(
  document: ExtractedDocument,
  config: PodcastConfig
): Promise<TranscriptSegment[]> {
  const { title, style, language, hostAName, hostBName } = config;
  const rawTurns: RawTurn[] = [];

  // 1. Intro-Sequenz basierend auf Stil und Dokumententitel
  const introTurns = createIntro(title || document.name, style, language, hostAName, hostBName);
  rawTurns.push(...introTurns);

  // 2. Kernaussagen & Abschnitte aufbereiten
  const sections = document.sections.length > 0 ? document.sections : [
    {
      title: 'Zusammenfassung',
      content: document.extractedText.slice(0, 1500),
      wordCount: document.wordCount,
      keyPoints: [document.extractedText.slice(0, 200)]
    }
  ];

  // Je nach ausgewähltem Stil filtern / anpassen
  const targetSectionCount = style === 'tldr' ? Math.min(3, sections.length) : Math.min(7, sections.length);
  const activeSections = sections.slice(0, targetSectionCount);

  for (let index = 0; index < activeSections.length; index++) {
    const sec = activeSections[index];
    const sectionTurns = createSectionDialogue(
      sec,
      index,
      activeSections.length,
      style,
      language,
      hostAName,
      hostBName
    );
    rawTurns.push(...sectionTurns);
  }

  // 3. Outro-Sequenz
  const outroTurns = createOutro(title || document.name, style, language, hostAName, hostBName, activeSections.length);
  rawTurns.push(...outroTurns);

  // Dauer berechnen und Segment-IDs vergeben
  return rawTurns.map((seg, idx) => ({
    ...seg,
    id: `seg_${Date.now()}_${idx}`,
    estimatedDuration: estimateSpeakingTime(seg.text)
  }));
}

function estimateSpeakingTime(text: string): number {
  // Durchschnittlich ca. 130 Wörter pro Minute (~2.1 Wörter/Sekunde)
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(2, Math.round(words / 2.2));
  return seconds;
}

function createIntro(
  docTitle: string,
  style: string,
  lang: string,
  hostA: string,
  hostB: string
): Omit<TranscriptSegment, 'id' | 'estimatedDuration'>[] {
  const cleanTitle = docTitle.replace(/\.(pdf|docx|txt|md)$/i, '');

  if (lang === 'en') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Welcome back to another episode! Today we have something really exciting on the table: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Hey everyone! Yes, I read through the document, and honestly, there are some mind-blowing insights you definitely don't want to miss.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: style === 'tldr'
          ? `Let's keep it sharp and focused—here are the key takeaways in under five minutes.`
          : `Let's break down the main arguments, chapter by chapter. Where should we start, ${hostB}?`,
        tone: 'insightful'
      }
    ];
  }

  // Deutsch (Standard)
  if (style === 'tldr') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Herzlich willkommen zum DocuCast Kompakt-Briefing! Wir werfen heute einen schnellen, präzisen Blick auf das Dokument „${cleanTitle}“.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Hallo ${hostA}! Perfekt für alle, die wenig Zeit haben. Ich habe die wichtigsten Fakten und Kernaussagen direkt herausgefiltert.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Kein langes Vorgeplänkel: Lass uns direkt mit den drei wichtigsten Kernpunkten starten!`,
        tone: 'insightful'
      }
    ];
  }

  if (style === 'interview') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Willkommen zu unserer Gesprächsrunde! Heute sprechen wir über das Thema „${cleanTitle}“. Schön, dass du da bist, ${hostB}.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Freut mich sehr, ${hostA}! Das vorliegende Dokument liefert wirklich spannende Einblicke und wirft einige interessante Fragen auf.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Genau das wollen wir heute vertiefen. Du hast dir die Details genau angesehen – wie lautet dein erster Eindruck?`,
        tone: 'questioning'
      }
    ];
  }

  // Deep Dive & Storytelling
  return [
    {
      speaker: 'hostA',
      speakerName: hostA,
      text: `Hallo und herzlich willkommen zum DocuCast Deep Dive! Auf unserem Schreibtisch liegt heute eine hochinteressante Ausarbeitung: „${cleanTitle}“.`,
      tone: 'enthusiastic'
    },
    {
      speaker: 'hostB',
      speakerName: hostB,
      text: `Hi ${hostA}! Ich habe mich da gestern Abend noch intensiv eingelesen. Da stecken wirklich einige Erkenntnisse drin, die man auf den ersten Blick gar nicht vermutet hätte.`,
      tone: 'curious'
    },
    {
      speaker: 'hostA',
      speakerName: hostA,
      text: `Absolut. Wir nehmen uns die Zeit, die Kerngedanken und Hintergründe Stück für Stück zu beleuchten. Wo steigen wir am besten ein?`,
      tone: 'insightful'
    }
  ];
}

function createSectionDialogue(
  section: DocumentSection,
  index: number,
  totalSections: number,
  style: string,
  lang: string,
  hostA: string,
  hostB: string
): Omit<TranscriptSegment, 'id' | 'estimatedDuration'>[] {
  const turns: Omit<TranscriptSegment, 'id' | 'estimatedDuration'>[] = [];
  const cleanTitle = section.title.replace(/^#+\s*/, '').trim();

  // Relevante Sätze filtern
  const rawSentences = section.content
    .replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith('---'));

  function cleanSentence(s: string): string {
    const trimmed = s.trim().replace(/[.,!?:;]+$/, '');
    if (!trimmed) return '';
    return trimmed + '.';
  }

  const rawLead = section.keyPoints[0] || rawSentences[0] || `${cleanTitle} ist ein zentraler Baustein des Textes.`;
  const rawDetail = section.keyPoints[1] || rawSentences[1] || `Hierbei spielen konkrete Rahmenbedingungen eine wesentliche Rolle.`;
  const rawReflection = section.keyPoints[2] || rawSentences[2] || `Das zeigt deutlich, wie wichtig eine ganzheitliche Betrachtung ist.`;

  const leadSentence = cleanSentence(rawLead);
  const detailSentence = cleanSentence(rawDetail);
  const reflectionSentence = cleanSentence(rawReflection);

  // Übergangsworte je nach Position
  const transitionsA = [
    `Schauen wir uns als Erstes den Bereich „${cleanTitle}“ an.`,
    `Ein weiterer Kernpunkt im Dokument betrifft „${cleanTitle}“.`,
    `Jetzt wird es besonders spannend: Im nächsten Abschnitt geht es um „${cleanTitle}“.`,
    `Dazu passend führt der Autor das Thema „${cleanTitle}“ an.`,
    `Kommen wir zu einem weiteren entscheidenden Aspekt: „${cleanTitle}“.`
  ];
  const transition = transitionsA[index % transitionsA.length];

  if (style === 'tldr') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `${transition} Die zentrale Botschaft hier lautet: ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Genau. Und in der Praxis bedeutet das: ${detailSentence}. Das ist der entscheidende Hebel, den man mitnehmen muss.`,
      tone: 'enthusiastic'
    });
  } else if (style === 'interview') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `${transition} Was sagt der Text konkret dazu?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Ein ganz wesentlicher Punkt ist: ${leadSentence} Die Analyse hebt hervor, dass ${detailSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Sehr einleuchtend! Das knüpft ja direkt an die Praxis an.`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Ganz genau. Ergänzend wird betont: ${reflectionSentence}`,
      tone: 'insightful'
    });
  } else {
    // Deep Dive
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `${transition} Hier wird dargelegt: ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Interessant ist vor allem die Begründung dahinter. Im Text steht nämlich auch: ${detailSentence}`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Stimmt, das rückt das Ganze in einen ganz neuen Kontext. Was folgert der Text daraus für die Umsetzung?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Das Fazit an dieser Stelle bringt es auf den Punkt: ${reflectionSentence}. Ein bemerkenswerter Gedanke!`,
      tone: 'insightful'
    });
  }

  return turns;
}

function createOutro(
  docTitle: string,
  style: string,
  lang: string,
  hostA: string,
  hostB: string,
  sectionCount: number
): Omit<TranscriptSegment, 'id' | 'estimatedDuration'>[] {
  const cleanTitle = docTitle.replace(/\.(pdf|docx|txt|md)$/i, '');

  if (lang === 'en') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `And that brings us to the conclusion of our discussion on "${cleanTitle}". What is your final takeaway, ${hostB}?`,
        tone: 'insightful'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `I'd say the core message is clear: understanding these principles gives anyone a massive advantage. Great read!`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Thanks for tuning in to DocuCast! Keep learning and see you in the next episode!`,
        tone: 'enthusiastic'
      }
    ];
  }

  // Deutsch
  return [
    {
      speaker: 'hostA',
      speakerName: hostA,
      text: `Damit haben wir die ${sectionCount} Kernbereiche aus „${cleanTitle}“ im Detail beleuchtet. Wie lautet dein persönliches Schlussfazit, ${hostB}?`,
      tone: 'questioning'
    },
    {
      speaker: 'hostB',
      speakerName: hostB,
      text: `Für mich ist das Entscheidende: Das Dokument liefert nicht nur theoretische Ansätze, sondern greifbare Erkenntnisse, die direkt Mehrwert schaffen. Absolut lesenswert!`,
      tone: 'enthusiastic'
    },
    {
      speaker: 'hostA',
      speakerName: hostA,
      text: `Ein perfektes Schlusswort! Vielen Dank fürs Zuhören bei dieser Ausgabe von DocuCast. Ihr könnt das Skript direkt nachlesen oder als Audio offline speichern. Bis zum nächsten Mal!`,
      tone: 'enthusiastic'
    }
  ];
}
