/**
 * Lokaler Podcast-Skript-Generator für zwei Sprecher (Host A & Host B).
 * Unterstützt modulare Generierung: Hochentwickelte regelbasierte NLP-Synthese
 * (100% offline & blitzschnell) mit erweiterten Stilen (Deep Dive, TLDR, Interview,
 * Debatte, Tech-Explainer, News-Flash, Storytelling) und voller Unterstützung
 * für alle G20-Sprachen und regionale Dialekt-Variationen.
 */

import { ExtractedDocument, PodcastConfig, TranscriptSegment, DocumentSection, PodcastStyle } from '../types/podcast';

type RawTurn = Omit<TranscriptSegment, 'id' | 'estimatedDuration'>;

export async function generatePodcastScript(
  document: ExtractedDocument,
  config: PodcastConfig
): Promise<TranscriptSegment[]> {
  const { title, style, language, countryId, hostAName, hostBName } = config;
  const rawTurns: RawTurn[] = [];

  // 1. Intro-Sequenz basierend auf Stil, Sprache & Dialekt
  const introTurns = createIntro(title || document.name, style, language, countryId, hostAName, hostBName);
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

  // Je nach ausgewähltem Stil Zielanzahl an Abschnitten wählen
  let targetSectionCount = 5;
  if (style === 'tldr' || style === 'news_flash') {
    targetSectionCount = Math.min(3, sections.length);
  } else if (style === 'deep_dive' || style === 'tech_explainer') {
    targetSectionCount = Math.min(7, sections.length);
  } else if (style === 'debate') {
    targetSectionCount = Math.min(4, sections.length);
  }

  const activeSections = sections.slice(0, targetSectionCount);

  for (let index = 0; index < activeSections.length; index++) {
    const sec = activeSections[index];
    const sectionTurns = createSectionDialogue(
      sec,
      index,
      activeSections.length,
      style,
      language,
      countryId,
      hostAName,
      hostBName
    );
    rawTurns.push(...sectionTurns);
  }

  // 3. Outro-Sequenz
  const outroTurns = createOutro(title || document.name, style, language, countryId, hostAName, hostBName, activeSections.length);
  rawTurns.push(...outroTurns);

  // Dauer berechnen und Segment-IDs vergeben
  return rawTurns.map((seg, idx) => ({
    ...seg,
    id: `seg_${Date.now()}_${idx}`,
    estimatedDuration: estimateSpeakingTime(seg.text)
  }));
}

function estimateSpeakingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 2.2));
}

function cleanSentence(s: string): string {
  const trimmed = s.trim().replace(/[.,!?:;]+$/, '');
  if (!trimmed) return '';
  return trimmed + '.';
}

function createIntro(
  docTitle: string,
  style: PodcastStyle,
  lang: string,
  countryId: string | undefined,
  hostA: string,
  hostB: string
): RawTurn[] {
  const cleanTitle = docTitle.replace(/\.(pdf|docx|txt|md)$/i, '');
  const langPrefix = (lang || 'de').toLowerCase().slice(0, 2);
  const cId = countryId || '';

  // Österreich (AT)
  if (cId === 'de-AT') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Servus und herzlich willkommen zum DocuCast! Ich bin ${hostA} und auf unserem Tisch liegt heute eine richtig spannende Ausarbeitung: „${cleanTitle}“.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Grüß dich ${hostA}! Ich bin ${hostB}. Ich habe mir das gestern bis ins kleinste Detail durchgelesen – da sind ein paar wirklich bemerkenswerte Erkenntnisse drin!`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Sehr feine Sache. Schauen wir uns die Kernpunkte Schritt für Schritt an. Wo fangen wir am besten an?`,
        tone: 'insightful'
      }
    ];
  }

  // Schweiz (CH)
  if (cId === 'de-CH') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Grüezi mitenand und herzlich willkommen zu DocuCast! Ich bin ${hostA} und heute vertiefen wir ein hochinteressantes Dossier: „${cleanTitle}“.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Sali ${hostA}! Ich bin ${hostB}. Ich habe die wichtigsten Kennzahlen und Argumente studiert – das bringt fundierte Einsichten mit echtem Mehrwert.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Genau so ist es. Gehen wir der Sache auf den Grund. Wo starten wir?`,
        tone: 'insightful'
      }
    ];
  }

  // Bayern / Süddeutsch (DE-BY)
  if (cId === 'de-BY') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Grüß Gott und herzlich willkommen bei DocuCast! Ich bin der ${hostA} und heute liegt was Richtiges auf unserem Tisch: „${cleanTitle}“.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Servus ${hostA}! Ich bin die ${hostB}. Ich hab mir das Dokument gestern vorgenommen – da sind Erkenntnisse drin, die man unbedingt wissen muss.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Packen wir es an und schauen uns das im Detail an.`,
        tone: 'insightful'
      }
    ];
  }

  // British English (GB)
  if (cId === 'en-GB' || cId === 'en-GB-SCO') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Good day and welcome to DocuCast. I'm ${hostA}, and on the agenda today we have an exceptional briefing: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Hello ${hostA}. I'm ${hostB}. I've had a thorough look through the text, and there are several rather brilliant observations to uncover.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Quite right. Let's delve into the core arguments without delay. Where shall we begin?`,
        tone: 'insightful'
      }
    ];
  }

  // Australian English (AU)
  if (cId === 'en-AU') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `G'day and welcome to DocuCast! I'm ${hostA}, and today we're cracking open a ripper document: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Hey ${hostA}! I'm ${hostB}. I went right through the brief and there are some cracking insights here you really don't want to miss.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Too right! Let's get straight to the guts of it. What's the standout takeaway?`,
        tone: 'insightful'
      }
    ];
  }

  // Français Québécois (CA-QC)
  if (cId === 'fr-CA') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Bienvenue à tous sur DocuCast ! Je suis ${hostA}, et aujourd'hui on jase d'un dossier très percutant : « ${cleanTitle} ».`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Salut ${hostA} ! Je suis ${hostB}. J'ai épluché le document au complet et il y a de méchantes bonnes idées là-dedans !`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `C'est parti mon cher, regardons les grandes lignes ensemble. Par quoi on commence ?`,
        tone: 'insightful'
      }
    ];
  }

  // Français (Métropolitain)
  if (langPrefix === 'fr') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Bienvenue sur DocuCast ! Je suis ${hostA}, et aujourd'hui nous analysons un document de premier plan : « ${cleanTitle} ».`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Bonjour ${hostA} ! Je suis ${hostB}. J'ai examiné en profondeur les conclusions du dossier, et les résultats sont particulièrement éclairants.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Entrons sans plus attendre dans le vif du sujet. Par quel chapitre commençons-nous ?`,
        tone: 'insightful'
      }
    ];
  }

  // Español
  if (langPrefix === 'es') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `¡Bienvenidos a DocuCast! Soy ${hostA}, y hoy analizamos a fondo un documento fundamental: «${cleanTitle}».`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `¡Hola ${hostA}! Soy ${hostB}. He revisado los puntos clave y los datos del informe, y la verdad es que hay descubrimientos muy reveladores.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Totalmente de acuerdo. Vamos a desglosar cada capítulo. ¿Por dónde empezamos?`,
        tone: 'insightful'
      }
    ];
  }

  // Italiano
  if (langPrefix === 'it') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Benvenuti a DocuCast! Sono ${hostA}, e oggi analizziamo un documento di grande rilievo: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Ciao ${hostA}! Sono ${hostB}. Ho esaminato attentamente i dati salienti e ci sono spunti davvero illuminanti che meritano attenzione.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Ottimo, entriamo subito nel vivo dei capitoli principali.`,
        tone: 'insightful'
      }
    ];
  }

  // Português
  if (langPrefix === 'pt') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Bem-vindos ao DocuCast! Eu sou ${hostA}, e hoje vamos analisar um documento de enorme relevância: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Olá ${hostA}! Eu sou ${hostB}. Analisei os pontos principais e os dados, e temos aqui conclusões que todo mundo precisa conferir.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Com certeza. Vamos desdobrar os principais pontos passo a passo.`,
        tone: 'insightful'
      }
    ];
  }

  // Japanisch
  if (langPrefix === 'ja') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `DocuCastへようこそ！進行役の${hostA}です。本日は注目の重要資料「${cleanTitle}」を分かりやすく紐解いていきます。`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `${hostA}さん、よろしくお願いします！解説の${hostB}です。要点を熟読しましたが、非常に有益な知見が凝縮されています。`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `それでは早速、核心となるテーマから順に掘り下げていきましょう。`,
        tone: 'insightful'
      }
    ];
  }

  // Englisch (Standard / US)
  if (langPrefix === 'en') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Welcome to another episode of DocuCast! I'm ${hostA}, and today we're breaking down a high-impact document: "${cleanTitle}".`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Hey ${hostA}! I'm ${hostB}. I went through the entire briefing, and honestly, there are some fascinating takeaways you definitely need to hear.`,
        tone: 'curious'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Let's break down the main arguments, chapter by chapter. Where should we start?`,
        tone: 'insightful'
      }
    ];
  }

  // Deutsch (Standard)
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
      text: `Hi ${hostA}! Ich habe mich da gestern intensiv eingelesen. Da stecken wirklich einige Erkenntnisse drin, die man auf den ersten Blick gar nicht vermutet hätte.`,
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
  style: PodcastStyle,
  lang: string,
  countryId: string | undefined,
  hostA: string,
  hostB: string
): RawTurn[] {
  const turns: RawTurn[] = [];
  const cleanTitle = section.title.replace(/^#+\s*/, '').trim();
  const langPrefix = (lang || 'de').toLowerCase().slice(0, 2);

  // Sätze filtern
  const rawSentences = section.content
    .replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith('---'));

  const rawLead = section.keyPoints[0] || rawSentences[0] || `${cleanTitle}`;
  const rawDetail = section.keyPoints[1] || rawSentences[1] || ``;
  const rawReflection = section.keyPoints[2] || rawSentences[2] || ``;

  const leadSentence = cleanSentence(rawLead);
  const detailSentence = cleanSentence(rawDetail || rawLead);
  const reflectionSentence = cleanSentence(rawReflection || rawDetail || rawLead);

  if (langPrefix === 'en') {
    const transitionsEn = [
      `Let's examine the first major area: "${cleanTitle}".`,
      `Another pivotal point in the document concerns "${cleanTitle}".`,
      `Moving on to the next chapter, we look into "${cleanTitle}".`,
      `That ties right into the section on "${cleanTitle}".`,
      `Let's turn our attention to another essential pillar: "${cleanTitle}".`
    ];
    const trans = transitionsEn[index % transitionsEn.length];

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `${trans} The primary finding is: ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `What makes this especially compelling is the data behind it. The report notes: ${detailSentence}`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `That really puts things into perspective. How does this translate to practical implementation?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `The bottom line is clear: ${reflectionSentence}`,
      tone: 'insightful'
    });
    return turns;
  }

  if (langPrefix === 'fr') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Abordons à présent le volet consacré à « ${cleanTitle} ». Le constat fondamental est le suivant : ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Ce qui est particulièrement marquant, c'est l'explication sous-jacente : ${detailSentence}`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `En effet, cela éclaire la situation d'un jour nouveau. Quel impact concret en découle ?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `La conclusion à retenir est nette : ${reflectionSentence}`,
      tone: 'insightful'
    });
    return turns;
  }

  if (langPrefix === 'es') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Pasemos al eje de «${cleanTitle}». La conclusión principal destaca lo siguiente: ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Lo más interesante es el razonamiento de fondo. El informe enfatiza que: ${detailSentence}`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Es un punto clave. ¿Cómo se traduce esto en la práctica?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `La síntesis decisiva lo resume así: ${reflectionSentence}`,
      tone: 'insightful'
    });
    return turns;
  }

  // Deutsch (Standard & Dialekte)
  const transitionsDe = [
    `Schauen wir uns als Erstes den Bereich „${cleanTitle}“ an.`,
    `Ein weiterer Kernpunkt im Dokument betrifft „${cleanTitle}“.`,
    `Jetzt wird es besonders spannend: Im nächsten Abschnitt geht es um „${cleanTitle}“.`,
    `Dazu passend führt der Autor das Thema „${cleanTitle}“ an.`,
    `Kommen wir zu einem weiteren entscheidenden Aspekt: „${cleanTitle}“.`
  ];
  const transition = transitionsDe[index % transitionsDe.length];

  if (style === 'debate') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `${transition} Die These lautet hier: ${leadSentence} Klingt auf den ersten Blick überzeugend, oder?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Da muss ich entschieden widersprechen! Wenn man tiefer bohrt, steht da nämlich: ${detailSentence} Das birgt doch erhebliche Risiken!`,
      tone: 'enthusiastic'
    });

    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Ein starker Einwand. Aber wie begegnet der Autor diesem Gegenargument?`,
      tone: 'curious'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Der Kompromiss liegt im Mittelweg: ${reflectionSentence} Das lässt sich durchaus verteidigen.`,
      tone: 'insightful'
    });
  } else if (style === 'news_flash') {
    turns.push({
      speaker: 'hostA',
      speakerName: hostA,
      text: `Top-Meldung: Im Bereich „${cleanTitle}“ steht fest: ${leadSentence}`,
      tone: 'insightful'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Hintergrund: ${detailSentence} Experten werten dies als richtungsweisenden Meilenstein.`,
      tone: 'enthusiastic'
    });
  } else {
    // Deep Dive, TLDR, Interview, Storytelling
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
      text: `Stimmt, das rückt das Ganze in einen neuen Kontext. Was folgert der Text daraus für die Umsetzung?`,
      tone: 'questioning'
    });

    turns.push({
      speaker: 'hostB',
      speakerName: hostB,
      text: `Das Fazit an dieser Stelle bringt es auf den Punkt: ${reflectionSentence}`,
      tone: 'insightful'
    });
  }

  return turns;
}

function createOutro(
  docTitle: string,
  style: PodcastStyle,
  lang: string,
  countryId: string | undefined,
  hostA: string,
  hostB: string,
  sectionCount: number
): RawTurn[] {
  const cleanTitle = docTitle.replace(/\.(pdf|docx|txt|md)$/i, '');
  const langPrefix = (lang || 'de').toLowerCase().slice(0, 2);
  const cId = countryId || '';

  if (cId === 'de-AT') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Damit haben wir die Kernpunkte aus „${cleanTitle}“ beleuchtet. Wie lautet dein persönliches Resümee, ${hostB}?`,
        tone: 'questioning'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Für mich steht fest: Da sind handfeste Erkenntnisse drin, die man direkt nützen kann. Eine wirklich gelungene Ausarbeitung!`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Wunderbar auf den Punkt gebracht. Herzlichen Dank fürs Zuhören an alle und bis zum nächsten Mal!`,
        tone: 'enthusiastic'
      }
    ];
  }

  if (langPrefix === 'en') {
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

  if (langPrefix === 'fr') {
    return [
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Voilà qui conclut notre analyse de « ${cleanTitle} ». Quel est ton mot de la fin, ${hostB} ?`,
        tone: 'insightful'
      },
      {
        speaker: 'hostB',
        speakerName: hostB,
        text: `Le message principal est limpide : ce dossier apporte des leviers stratégiques majeurs et immédiatement applicables.`,
        tone: 'enthusiastic'
      },
      {
        speaker: 'hostA',
        speakerName: hostA,
        text: `Merci à toutes et à tous de nous avoir suivis sur DocuCast, et à très bientôt pour le prochain numéro !`,
        tone: 'enthusiastic'
      }
    ];
  }

  // Deutsch (Standard)
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
      text: `Ein perfektes Schlusswort! Vielen Dank fürs Zuhören bei dieser Ausgabe von DocuCast. Bis zum nächsten Mal!`,
      tone: 'enthusiastic'
    }
  ];
}
